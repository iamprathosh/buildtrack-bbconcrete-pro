import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Package, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BBLogo from "@/assets/bb-logo.svg";

const BarcodeScanning = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const mockScanResult = {
    sku: "CON-001",
    name: "Concrete Mix #1",
    category: "Concrete",
    available: 45,
    unit: "bags",
    location: "Warehouse A"
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setScannedItem(mockScanResult);
      setIsScanning(false);
    }, 2000);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Reset for next scan
      setScannedItem(null);
      setQuantity(1);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link to="/worker/inventory">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <img src={BBLogo} alt="BuildTrack" className="h-6 brightness-0 invert" />
          <div>
            <h1 className="font-montserrat font-bold text-lg">Barcode Scanner</h1>
            <p className="font-inter text-sm opacity-90">Scan items to manage inventory</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Camera View */}
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader className="text-center">
              <CardTitle className="font-montserrat font-bold text-foreground">
                {isScanning ? "Scanning..." : "Position Barcode in Frame"}
              </CardTitle>
              <CardDescription className="font-inter">
                Align the barcode within the scanning area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg aspect-square flex items-center justify-center">
                {/* Simulated camera view */}
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/70 text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm font-inter">
                        {isScanning ? "Scanning..." : "Camera View"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Scanning animation */}
                  {isScanning && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary animate-pulse"></div>
                  )}
                </div>

                {/* Scanning overlay */}
                <div className="absolute inset-8 border-2 border-primary rounded-lg opacity-50"></div>
              </div>

              <Button 
                onClick={handleScan}
                disabled={isScanning || scannedItem}
                variant="primary"
                className="w-full mt-4"
              >
                {isScanning ? "Scanning..." : "Start Scan"}
              </Button>
            </CardContent>
          </Card>

          {/* Scanned Item Details */}
          {scannedItem && (
            <Card className="gradient-card border-0 shadow-brand">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Item Scanned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-inter text-muted-foreground">Name:</span>
                    <span className="font-inter font-medium">{scannedItem.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-muted-foreground">SKU:</span>
                    <span className="font-inter font-medium">{scannedItem.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-muted-foreground">Available:</span>
                    <span className="font-inter font-medium">{scannedItem.available} {scannedItem.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-inter text-muted-foreground">Location:</span>
                    <span className="font-inter font-medium">{scannedItem.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="font-inter font-medium">
                    Quantity to Stock Out
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    max={scannedItem.available}
                    className="font-inter"
                  />
                </div>

                <Alert className="border-info/20 bg-info/10">
                  <Package className="h-4 w-4 text-info" />
                  <AlertDescription className="font-inter text-info">
                    This will record {quantity} {scannedItem.unit} being taken from {scannedItem.location}.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setScannedItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Confirm Stock Out"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Entry Option */}
          <Card className="gradient-card border-0 shadow-brand">
            <CardHeader>
              <CardTitle className="font-montserrat font-bold text-foreground">
                Manual Entry
              </CardTitle>
              <CardDescription className="font-inter">
                Enter SKU manually if scanning fails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Enter SKU (e.g., CON-001)"
                className="font-inter"
              />
              <Button variant="outline" className="w-full">
                Look Up Item
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanning;