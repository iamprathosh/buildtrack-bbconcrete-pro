import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminManagerGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

interface ImportRow {
  itemNumber: string;
  productName: string;
  category: string;
  uom: string;
  vendorNumber: string;
  vendorName: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [results, setResults] = useState<ImportRow[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row and parse data
      const rows = jsonData.slice(1) as any[];
      const preview: ImportRow[] = rows.slice(0, 10).map((row, index) => ({
        itemNumber: row[0]?.toString() || '',
        productName: row[1]?.toString() || '',
        category: row[2]?.toString() || '',
        uom: row[3]?.toString() || '',
        vendorNumber: row[4]?.toString() || '',
        vendorName: row[5]?.toString() || '',
        status: 'pending'
      }));

      setPreviewData(preview);
      setShowResults(false);
    } catch (error) {
      toast.error("Failed to parse Excel file");
      console.error(error);
    }
  };

  const processImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip header row
      const rows = jsonData.slice(1) as any[];
      const results: ImportRow[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const importRow: ImportRow = {
          itemNumber: row[0]?.toString() || '',
          productName: row[1]?.toString() || '',
          category: row[2]?.toString() || '',
          uom: row[3]?.toString() || '',
          vendorNumber: row[4]?.toString() || '',
          vendorName: row[5]?.toString() || '',
          status: 'pending'
        };

        try {
          // Create or find category
          let categoryId = null;
          if (importRow.category) {
            const { data: existingCategory } = await supabase
              .from('product_categories')
              .select('id')
              .eq('name', importRow.category)
              .single();

            if (existingCategory) {
              categoryId = existingCategory.id;
            } else {
              const { data: newCategory, error: categoryError } = await supabase
                .from('product_categories')
                .insert({ name: importRow.category })
                .select('id')
                .single();

              if (categoryError) throw categoryError;
              categoryId = newCategory.id;
            }
          }

          // Create or update vendor
          if (importRow.vendorName && importRow.vendorNumber) {
            const { error: vendorError } = await supabase
              .from('vendors')
              .upsert({
                vendor_number: parseInt(importRow.vendorNumber),
                name: importRow.vendorName
              }, {
                onConflict: 'vendor_number'
              });

            if (vendorError) throw vendorError;
          }

          // Create product
          const { error: productError } = await supabase
            .from('products')
            .upsert({
              sku: importRow.itemNumber,
              name: importRow.productName,
              category_id: categoryId,
              unit_of_measure: importRow.uom || 'EA',
              supplier: importRow.vendorName,
              current_stock: 0,
              min_stock_level: 0,
              max_stock_level: 1000
            }, {
              onConflict: 'sku'
            });

          if (productError) throw productError;

          importRow.status = 'success';
        } catch (error) {
          importRow.status = 'error';
          importRow.error = error instanceof Error ? error.message : 'Unknown error';
        }

        results.push(importRow);
        setProgress(((i + 1) / rows.length) * 100);
      }

      setResults(results);
      setShowResults(true);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      toast.success(`Import completed: ${successCount} successful, ${errorCount} failed`);
    } catch (error) {
      toast.error("Import failed");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const getStatusIcon = (status: ImportRow['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ImportRow['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <AdminManagerGuard showError>
      <AppLayout title="Bulk Import" subtitle="Import inventory data from Excel files">
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Excel File
              </CardTitle>
              <CardDescription>
                Upload an Excel file with columns: Item Number, Product Name, Category, UOM, Vendor Number, Vendor Name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select Excel File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
              </div>

              {file && (
                <Alert>
                  <FileSpreadsheet className="h-4 w-4" />
                  <AlertDescription>
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}

              {previewData.length > 0 && !showResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Preview (First 10 rows)</h3>
                    <Button onClick={processImport} disabled={importing}>
                      {importing ? "Importing..." : "Start Import"}
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Number</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>UOM</TableHead>
                          <TableHead>Vendor #</TableHead>
                          <TableHead>Vendor Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">{row.itemNumber}</TableCell>
                            <TableCell>{row.productName}</TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell>{row.uom}</TableCell>
                            <TableCell>{row.vendorNumber}</TableCell>
                            <TableCell>{row.vendorName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing products...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {showResults && (
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
                <CardDescription>
                  {results.filter(r => r.status === 'success').length} successful, {' '}
                  {results.filter(r => r.status === 'error').length} failed out of {results.length} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Item Number</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(row.status)}
                              {getStatusBadge(row.status)}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{row.itemNumber}</TableCell>
                          <TableCell>{row.productName}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell className="text-sm text-red-600">
                            {row.error}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </AdminManagerGuard>
  );
}