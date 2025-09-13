import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionModal } from "./SubscriptionModal";
import { DatabaseService } from "@/lib/database";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Subscription {
  id: string;
  planName: string;
  status: "active" | "paused" | "terminated";
  startDate: string;
  endDate: string;
  price: number;
  dataQuota: string;
  speed: string;
  technology: "fibernet" | "copper";
  usage: number; // in GB
}

// Mock subscriptions removed - now using real data from Supabase

export const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{type: string; subscription: Subscription} | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const user = await AuthService.getCurrentUser();
        if (!user) {
          toast({
            title: "Error",
            description: "User not authenticated",
            variant: "destructive",
          });
          return;
        }

        const data = await DatabaseService.getUserSubscriptions(user.id);
        setSubscriptions(data.map(sub => ({
          id: sub.id,
          planName: sub.plans?.name || 'Unknown Plan',
          status: sub.status,
          startDate: sub.start_date,
          endDate: sub.end_date,
          price: sub.price,
          dataQuota: sub.plans?.data_quota || 'Unknown',
          speed: sub.plans?.speed || 'Unknown',
          technology: sub.plans?.technology || 'fibernet',
          usage: sub.usage_gb
        })));
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load subscriptions: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [toast]);

  const handleAction = (type: string, subscription: Subscription) => {
    setModalAction({ type, subscription });
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!modalAction) return;

    const { type, subscription } = modalAction;
    
    try {
      if (type === "cancel") {
        await DatabaseService.cancelSubscription(subscription.id);
        setSubscriptions(prev => prev.map(sub => 
          sub.id === subscription.id 
            ? { ...sub, status: "terminated" as const }
            : sub
        ));
        toast({
          title: "Success",
          description: "Subscription cancelled successfully",
        });
      } else if (type === "renew") {
        await DatabaseService.updateSubscription(subscription.id, { status: "active" });
        setSubscriptions(prev => prev.map(sub => 
          sub.id === subscription.id 
            ? { ...sub, status: "active" as const }
            : sub
        ));
        toast({
          title: "Success",
          description: "Subscription renewed successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update subscription: " + error.message,
        variant: "destructive",
      });
    }

    setModalOpen(false);
    setModalAction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "terminated":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Subscriptions</h1>
          <p className="text-muted-foreground mt-2">Manage your active subscriptions and billing</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Subscriptions</h1>
        <p className="text-muted-foreground mt-2">Manage your active subscriptions and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Plan Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Technology</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Usage</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">End Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => {
                  const getTechnologyColor = (tech: string) => {
                    switch (tech) {
                      case "fibernet":
                        return "bg-lumen-blue-50 text-lumen-blue-600 hover:bg-lumen-blue-100 border-lumen-blue-200";
                      case "copper":
                        return "bg-lumen-orange-50 text-lumen-orange-600 hover:bg-lumen-orange-100 border-lumen-orange-200";
                      default:
                        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
                    }
                  };

                  const getUsagePercentage = (usage: number, quota: string) => {
                    if (quota === "Unlimited") return 0;
                    const quotaNum = parseInt(quota.replace("GB", ""));
                    return Math.min((usage / quotaNum) * 100, 100);
                  };

                  const usagePercentage = getUsagePercentage(subscription.usage, subscription.dataQuota);
                  const isNearLimit = usagePercentage > 80;

                  return (
                    <tr 
                      key={subscription.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 font-medium text-foreground">{subscription.planName}</td>
                      <td className="py-4 px-4">
                        <Badge className={getTechnologyColor(subscription.technology)}>
                          {subscription.technology}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            {subscription.usage}GB / {subscription.dataQuota}
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isNearLimit ? 'bg-red-500' : 'bg-accent'
                              }`}
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                          {isNearLimit && (
                            <div className="text-xs text-red-600 font-medium">
                              Near limit!
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{subscription.endDate}</td>
                      <td className="py-4 px-4 font-semibold text-foreground">${subscription.price}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("upgrade", subscription)}
                            className="flex-1"
                          >
                            Upgrade
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("downgrade", subscription)}
                            className="flex-1"
                          >
                            Downgrade
                          </Button>
                          {subscription.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction("cancel", subscription)}
                              className="text-destructive hover:text-destructive"
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAction("renew", subscription)}
                              className="bg-orange hover:bg-orange-hover text-orange-foreground"
                            >
                              Renew
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SubscriptionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        action={modalAction}
        onConfirm={confirmAction}
      />
    </div>
  );
};