'use client';

import { Award, Flame, Target, TrendingUp, Calendar, CheckCircle2, Clock, Trophy, Star, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Medicine } from "@/lib/types";
import { useEffect, useState } from "react";

interface RewardsSummaryProps {
    points: number;
    streak: number;
    medicines: Medicine[];
}

interface ProgressStats {
    adherenceRate: number;
    totalDosesToday: number;
    takenDosesToday: number;
    missedDosesToday: number;
    weeklyStreak: number;
    monthlyPoints: number;
    achievementLevel: string;
    nextMilestone: number;
    pointsToNextLevel: number;
}

export default function RewardsSummary({ points, streak, medicines }: RewardsSummaryProps) {
  const [stats, setStats] = useState<ProgressStats>({
    adherenceRate: 0,
    totalDosesToday: 0,
    takenDosesToday: 0,
    missedDosesToday: 0,
    weeklyStreak: 0,
    monthlyPoints: 0,
    achievementLevel: 'Beginner',
    nextMilestone: 100,
    pointsToNextLevel: 100
  });

  useEffect(() => {
    calculateStats();
  }, [medicines, points]);

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayString = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Calculate today's doses
    let totalDosesToday = 0;
    let takenDosesToday = 0;
    medicines.forEach(medicine => {
      medicine.schedule.forEach(() => {
        totalDosesToday++;
        // Check if taken (this would need to be connected to actual intake data)
        takenDosesToday += Math.random() > 0.3 ? 1 : 0; // Mock data for now
      });
    });

    const adherenceRate = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;
    const missedDosesToday = totalDosesToday - takenDosesToday;
    
    // Calculate achievement level
    let achievementLevel = 'Beginner';
    let nextMilestone = 100;
    let pointsToNextLevel = 100;
    
    if (points >= 500) {
      achievementLevel = 'Expert';
      nextMilestone = 1000;
      pointsToNextLevel = 1000 - points;
    } else if (points >= 200) {
      achievementLevel = 'Advanced';
      nextMilestone = 500;
      pointsToNextLevel = 500 - points;
    } else if (points >= 100) {
      achievementLevel = 'Intermediate';
      nextMilestone = 200;
      pointsToNextLevel = 200 - points;
    } else {
      pointsToNextLevel = 100 - points;
    }

    setStats({
      adherenceRate,
      totalDosesToday,
      takenDosesToday,
      missedDosesToday,
      weeklyStreak: Math.min(streak * 7, 30), // Mock weekly calculation
      monthlyPoints: Math.round(points * 0.3), // Mock monthly calculation
      achievementLevel,
      nextMilestone,
      pointsToNextLevel
    });
  };

  const getAchievementIcon = (level: string) => {
    switch (level) {
      case 'Expert': return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'Advanced': return <Star className="h-6 w-6 text-purple-500" />;
      case 'Intermediate': return <Zap className="h-6 w-6 text-blue-500" />;
      default: return <Award className="h-6 w-6 text-green-500" />;
    }
  };

  const getAchievementColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Progress Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Your Health Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Achievement Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getAchievementIcon(stats.achievementLevel)}
              <div>
                <div className="font-semibold text-lg">{stats.achievementLevel}</div>
                <div className="text-sm text-muted-foreground">Achievement Level</div>
              </div>
            </div>
            <Badge className={getAchievementColor(stats.achievementLevel)}>
              Level {stats.achievementLevel}
            </Badge>
          </div>

          {/* Points Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress to Next Level</span>
              <span className="text-sm text-muted-foreground">{points} / {stats.nextMilestone}</span>
            </div>
            <Progress 
              value={(points / stats.nextMilestone) * 100} 
              className="h-3"
            />
            <div className="text-xs text-muted-foreground text-center">
              {stats.pointsToNextLevel} points to go!
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{points.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Today's Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.takenDosesToday}</div>
              <div className="text-xs text-muted-foreground">Taken</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <Clock className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.missedDosesToday}</div>
              <div className="text-xs text-muted-foreground">Missed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.adherenceRate}%</div>
              <div className="text-xs text-muted-foreground">Adherence</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Adherence Rate</span>
              <span className="text-sm text-muted-foreground">{stats.adherenceRate}%</span>
            </div>
            <Progress value={stats.adherenceRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-600" />
            Weekly Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="font-semibold">Weekly Streak</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.weeklyStreak}</div>
              <div className="text-xs text-muted-foreground">days this week</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Monthly Points</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.monthlyPoints}</div>
              <div className="text-xs text-muted-foreground">this month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
