'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<'student' | 'lecturer'>('student');

  const handleContinue = () => {
    setRole(selectedRole);
    router.push('/hub');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In to ScholarSync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Dev auth switch: choose a role and continue to your hub.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={selectedRole === 'student' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('student')}
            >
              Student
            </Button>
            <Button
              type="button"
              variant={selectedRole === 'lecturer' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('lecturer')}
            >
              Lecturer
            </Button>
          </div>

          <Button className="w-full" onClick={handleContinue}>
            Continue to Hub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
