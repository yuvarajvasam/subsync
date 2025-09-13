import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Target, Star, Loader2 } from "lucide-react";
import { DatabaseService } from "@/lib/database";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  planName: string;
  currentPlan?: string;
  savings?: string;
  priority: "high" | "medium" | "low";
  icon: any;
  category: "usage" | "cost" | "performance" | "technology";
}

// Mock recommendations removed - now using real data from Supabase

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
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

        const data = await DatabaseService.getUserRecommendations(user.id);
        setRecommendations(data.map(rec => ({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          reason: rec.reason,
          planName: rec.plan_name,
          currentPlan: rec.current_plan || undefined,
          savings: rec.savings || undefined,
          priority: rec.priority,
          icon: getIconForCategory(rec.category),
          category: rec.category
        })));
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load recommendations: " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [toast]);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "usage":
        return TrendingUp;
      case "cost":
        return Target;
      case "performance":
        return Zap;
      case "technology":
        return Star;
      default:
        return Target;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "usage":
        return "bg-blue-100 text-blue-800";
      case "cost":
        return "bg-green-100 text-green-800";
      case "performance":
        return "bg-purple-100 text-purple-800";
      case "technology":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    console.log("Acting on recommendation:", recommendation.title);
    // Here you would handle the recommendation action (e.g., upgrade, switch billing)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
          <p className="text-muted-foreground mt-2">Personalized suggestions to optimize your subscription</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-muted-foreground">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
        <p className="text-muted-foreground mt-2">Personalized suggestions to optimize your subscription</p>
      </div>

      {/* AI-Powered Badge */}
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-accent" />
            <div>
              <h3 className="font-semibold text-foreground">AI-Powered Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Based on your usage patterns and subscription history
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground">
              We're analyzing your usage patterns to provide personalized recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {recommendations.map((recommendation) => {
          const Icon = recommendation.icon;
          return (
            <Card 
              key={recommendation.id}
              className="relative"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {recommendation.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority}
                    </Badge>
                    <Badge className={getCategoryColor(recommendation.category)}>
                      {recommendation.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Plan Details:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {recommendation.currentPlan && (
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2"></span>
                        Current: {recommendation.currentPlan}
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      Suggested: {recommendation.planName}
                    </div>
                    {recommendation.savings && (
                      <div className="flex items-center text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                        {recommendation.savings}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleRecommendationAction(recommendation)}
                    className="bg-orange hover:bg-orange-hover text-orange-foreground flex-1"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Usage Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Usage Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">320GB</div>
              <p className="text-sm text-muted-foreground">Data Used This Month</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">64%</div>
              <p className="text-sm text-muted-foreground">Quota Utilization</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <p className="text-sm text-muted-foreground">Connection Uptime</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">450 Mbps</div>
              <p className="text-sm text-muted-foreground">Average Speed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};