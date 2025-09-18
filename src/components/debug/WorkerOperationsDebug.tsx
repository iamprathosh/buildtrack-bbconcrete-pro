import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useProjectTransactions } from '@/hooks/useProjectTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const WorkerOperationsDebug = () => {
  const { profile, isLoading: profileLoading } = useUserProfile();

  // Test products fetch
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products-debug'],
    queryFn: async () => {
      console.log('🔍 Fetching products...');
      
      // First try simple query
      console.log('🔍 Step 1: Testing basic products query...');
      const { data: basicData, error: basicError } = await supabase
        .from('products')
        .select('id, name, sku, current_stock')
        .limit(5);
      
      console.log('📦 Basic products response:', { basicData, basicError });
      
      // Then try full query
      console.log('🔍 Step 2: Testing full products query...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          current_stock,
          unit_of_measure,
          image_url,
          mauc,
          is_active,
          product_categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      console.log('📦 Full products response:', { data, error, count: data?.length });
      
      if (error) {
        console.error('❌ Products query failed:', error);
        throw error;
      }
      return data;
    }
  });

  // Test projects fetch
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects-debug'],
    queryFn: async () => {
      console.log('🔍 Fetching projects...');
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, job_number, status, customer_id')
        .in('status', ['planning', 'active'])
        .order('name', { ascending: true });

      console.log('🏗️ Projects response:', { data, error });
      
      if (error) throw error;
      return data;
    }
  });

  // Test transactions fetch (using first project if available)
  const firstProjectId = projects?.[0]?.id;
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = 
    useProjectTransactions(firstProjectId);

  // Test direct Supabase connection
  const testConnection = async () => {
    console.log('🔍 Testing direct Supabase connection...');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('count(*)')
        .single();
      
      console.log('📊 Connection test result:', { data, error });
      alert(`Connection test: ${error ? 'FAILED - ' + error.message : 'SUCCESS - Found products'}`)
    } catch (err) {
      console.error('💥 Connection test failed:', err);
      alert('Connection test FAILED: ' + (err as Error).message);
    }
  };

  const renderStatus = (isLoading: boolean, error: any, data: any, label: string) => (
    <div className="flex items-center gap-2 p-2 border rounded">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : error ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-500" />
      )}
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : error ? `Error: ${error.message}` : `Success (${Array.isArray(data) ? data.length : 'N/A'} items)`}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Worker Operations Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} variant="outline">
            Test Direct Connection
          </Button>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">User Profile</h3>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-sm">
                {profileLoading ? 'Loading...' : JSON.stringify(profile, null, 2)}
              </pre>
            </div>

            <h3 className="text-lg font-semibold">Data Fetching Status</h3>
            {renderStatus(productsLoading, productsError, products, 'Products')}
            {renderStatus(projectsLoading, projectsError, projects, 'Projects')}
            {renderStatus(transactionsLoading, transactionsError, transactions, 'Transactions')}

            {products && (
              <>
                <h3 className="text-lg font-semibold">Sample Products ({products.length})</h3>
                <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                  <pre className="text-sm">
                    {JSON.stringify(products.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </>
            )}

            {projects && (
              <>
                <h3 className="text-lg font-semibold">Sample Projects ({projects.length})</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm">
                    {JSON.stringify(projects.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </>
            )}

            {transactions && (
              <>
                <h3 className="text-lg font-semibold">Sample Transactions ({transactions.length})</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm">
                    {JSON.stringify(transactions.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerOperationsDebug;