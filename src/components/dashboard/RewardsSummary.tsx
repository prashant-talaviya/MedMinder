import { Award, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface RewardsSummaryProps {
    points: number;
    streak: number;
}

export default function RewardsSummary({ points, streak }: RewardsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-headline">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
            <div className="p-2 bg-accent rounded-md">
                <Award className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">{points.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
            <div className="p-2 bg-accent rounded-md">
                <Flame className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
