import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { SubscriptionModal } from "./SubscriptionModal";
import { DatabaseService } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  type: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
  dataQuota: string;
  speed: string;
  technology: "fibernet" | "copper";
}

// Mock plans removed - now using real data from Supabase

export const BrowsePlans = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getPlans();
        setPlans(data.map(plan => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          type: plan.type,
          features: Array.isArray(plan.features) ? plan.features : [],
          popular: plan.is_popular,
          dataQuota: plan.data_quota,
          speed: plan.speed,
          technology: plan.technology,
          description: plan.description || undefined,
          status: plan.status
        })));
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load plans: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const confirmSubscription = async () => {
    if (selectedPlan) {
      try {
        // Create subscription logic here
        toast({
          title: "Success",
          description: `Subscribed to ${selectedPlan.name}`,
        });
        setModalOpen(false);
        setSelectedPlan(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to subscribe: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "monthly":
        return "bg-blue-100 text-blue-800";
      case "yearly":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTechnologyColor = (technology: string) => {
    switch (technology) {
      case "fibernet":
        return "bg-lumen-blue-50 text-lumen-blue-600 border-lumen-blue-200";
      case "copper":
        return "bg-lumen-orange-50 text-lumen-orange-600 border-lumen-orange-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Plans</h1>
          <p className="text-muted-foreground mt-2">Choose the perfect plan for your needs</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">Loading plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Browse Plans</h1>
        <p className="text-muted-foreground mt-2">Choose the perfect plan for your needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'ring-2 ring-accent' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.speed}
                  </p>
                </div>
                <Badge className={getTechnologyColor(plan.technology)}>
                  {plan.technology}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-primary">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm">
                  <span className="text-muted-foreground">Data Quota: </span>
                  <span className="text-primary">{plan.dataQuota}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={`
                    flex-1
                    ${plan.popular 
                      ? 'bg-orange hover:bg-orange-hover text-orange-foreground' 
                      : ''
                    }
                  `}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Subscribe Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SubscriptionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        action={selectedPlan ? { type: "subscribe", subscription: selectedPlan as any } : null}
        onConfirm={confirmSubscription}
      />
    </div>
  );
};