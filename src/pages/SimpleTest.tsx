import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';

const SimpleTest = () => {
  const [status, setStatus] = useState('Starting test...');
  const [results, setResults] = useState<any>({});

  useEffect(() => {
    const runTest = async () => {
      try {
        setStatus('Creating Supabase client...');
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        
        setStatus('Testing basic connection...');
        
        // Test 1: Basic connection (should work even without auth)
        try {
          const { data, error } = await supabase.from('products').select('count').single();
          setResults(prev => ({ ...prev, connection: 'Success', connectionError: null }));
          setStatus('Connection successful! Testing with fake auth...');
        } catch (error) {
          setResults(prev => ({ ...prev, connection: 'Failed', connectionError: error }));
          setStatus('Connection failed, but continuing...');
        }

        // Test 2: Set fake auth context
        try {
          await supabase.rpc('set_auth_context', { user_id: 'fake_test_user' });
          setResults(prev => ({ ...prev, authContext: 'Success', authError: null }));
          setStatus('Auth context set! Testing queries...');
        } catch (error) {
          setResults(prev => ({ ...prev, authContext: 'Failed', authError: error }));
          setStatus('Auth context failed, but continuing...');
        }

        // Test 3: Try to query products
        try {
          const { data: products, count, error } = await supabase
            .from('products')
            .select('id, name, current_stock', { count: 'exact' })
            .limit(3);
          
          if (error) throw error;
          
          setResults(prev => ({ 
            ...prev, 
            products: 'Success', 
            productsCount: count, 
            productsData: products,
            productsError: null 
          }));
          setStatus('Products query successful! Testing projects...');
        } catch (error) {
          setResults(prev => ({ ...prev, products: 'Failed', productsError: error }));
          setStatus('Products query failed, but continuing...');
        }

        // Test 4: Try to query projects
        try {
          const { data: projects, count, error } = await supabase
            .from('projects')
            .select('id, name, status', { count: 'exact' })
            .limit(3);
          
          if (error) throw error;
          
          setResults(prev => ({ 
            ...prev, 
            projects: 'Success', 
            projectsCount: count, 
            projectsData: projects,
            projectsError: null 
          }));
          setStatus('All tests completed successfully!');
        } catch (error) {
          setResults(prev => ({ ...prev, projects: 'Failed', projectsError: error }));
          setStatus('Projects query failed. Tests completed.');
        }

      } catch (error) {
        setStatus(`Fatal error: ${error}`);
        setResults(prev => ({ ...prev, fatalError: error }));
      }
    };

    runTest();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Simple Database Test</h1>
      <p><strong>Status:</strong> {status}</p>
      
      <div style={{ marginTop: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h3>Test Results:</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <h3>Expected Results:</h3>
        <ul>
          <li>✅ Connection: Should be "Success"</li>
          <li>✅ Auth Context: Should be "Success"</li>
          <li>✅ Products: Should be "Success" with count {'>='} 0</li>
          <li>✅ Projects: Should be "Success" with count {'>='} 0</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>← Back to Dashboard</a>
        {' | '}
        <a href="/auth-debug" style={{ color: 'blue', textDecoration: 'underline' }}>Auth Debug →</a>
      </div>
    </div>
  );
};

export default SimpleTest;