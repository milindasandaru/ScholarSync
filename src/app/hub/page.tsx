'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function HubPage() {
  const { currentUser, role } = useAuthStore();

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {currentUser.name}</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">
          {role} hub: choose where you want to continue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Q&A Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ask questions, track your thread, and collaborate module-by-module.
            </p>
            <Link href="/qna">
              <Button className="w-full">Go to Q&A</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Forum Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Explore knowledge posts, module updates, and general discussion.
            </p>
            <Link href="/forum">
              <Button variant="outline" className="w-full">
                Go to Forum
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
