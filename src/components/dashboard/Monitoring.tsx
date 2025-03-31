
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MonitoringService } from '@/services/monitoringService';
import { StorageService } from '@/services/storageService';
import { SchedulerService } from '@/services/schedulerService';
import { formatBytes, formatDate } from '@/utils/format';
import { AlertCircle, CheckCircle, Clock, HardDrive, Server } from 'lucide-react';

interface StorageStats {
  totalSize: number;
  videoCount: number;
  imageCount: number;
  coldStorageSize: number;
}

interface AlertStats {
  error: number;
  warning: number;
  info: number;
}

interface JobStatus {
  backup: boolean;
  storage: boolean;
  cleanup: boolean;
}

export function Monitoring() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [alertStats, setAlertStats] = useState<AlertStats>({ error: 0, warning: 0, info: 0 });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [jobStatus, setJobStatus] = useState<JobStatus>({ backup: false, storage: false, cleanup: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monitoringService = MonitoringService.getInstance();
        const storageService = StorageService.getInstance();
        const schedulerService = SchedulerService.getInstance();

        // Fetch storage stats
        const stats = await storageService.getStorageStats();
        setStorageStats(stats);

        // Fetch alert stats
        const alerts = monitoringService.getAlertStats();
        // Convert to AlertStats shape
        setAlertStats({
          error: alerts.error || 0,
          warning: alerts.warning || 0,
          info: alerts.info || 0
        });

        // Fetch recent alerts
        const recent = monitoringService.getRecentAlerts(5);
        setRecentAlerts(recent);

        // Fetch job status
        const status = schedulerService.getJobStatus();
        // Convert to JobStatus shape
        setJobStatus({
          backup: status.backup || false,
          storage: status.storage || false,
          cleanup: status.cleanup || false
        });
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading monitoring data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storageStats && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Storage</span>
                  <span>{formatBytes(storageStats.totalSize)}</span>
                </div>
                <Progress value={(storageStats.totalSize / (100 * 1024 * 1024 * 1024)) * 100} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{storageStats.videoCount}</div>
                  <div className="text-sm text-muted-foreground">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{storageStats.imageCount}</div>
                  <div className="text-sm text-muted-foreground">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatBytes(storageStats.coldStorageSize)}</div>
                  <div className="text-sm text-muted-foreground">Cold Storage</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobStatus && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {jobStatus.backup ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>Backup</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {jobStatus.storage ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>Storage</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {jobStatus.cleanup ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>Cleanup</span>
                  </div>
                </div>
              </div>
              {alertStats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{alertStats.error}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">{alertStats.warning}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{alertStats.info}</div>
                    <div className="text-sm text-muted-foreground">Info</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                <AlertTitle className="flex items-center gap-2">
                  {alert.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : alert.type === 'warning' ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {alert.message}
                </AlertTitle>
                <AlertDescription>
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatDate(alert.timestamp)}</span>
                    <Badge variant={alert.type === 'error' ? 'destructive' : 'default'}>
                      {alert.type}
                    </Badge>
                  </div>
                  {alert.metadata && (
                    <pre className="mt-2 rounded bg-muted p-2 text-xs">
                      {JSON.stringify(alert.metadata, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
