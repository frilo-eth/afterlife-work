import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CacheStats {
  hitRate: number;
  missRate: number;
  keyCount: number;
  isConnected: boolean;
}

export default function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats>({
    hitRate: 0,
    missRate: 0,
    keyCount: 0,
    isConnected: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/cache/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setError(null);
        } else {
          throw new Error('Failed to fetch cache stats');
        }
      } catch (error) {
        console.warn('Error fetching cache stats:', error);
        setError('Failed to connect to cache server');
      }
    };

    // Fetch initially and then every 30 seconds
    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!stats.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">Cache Status</h3>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cache server is not connected. Performance may be degraded.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">Cache Performance</h3>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Hit Rate</span>
                <span className="text-sm">{(stats.hitRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={stats.hitRate * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Miss Rate</span>
                <span className="text-sm">{(stats.missRate * 100).toFixed(1)}%</span>
              </div>
              <Progress value={stats.missRate * 100} className="h-2" />
            </div>

            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm">Cached Keys</span>
              <span className="text-sm font-medium">{stats.keyCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 