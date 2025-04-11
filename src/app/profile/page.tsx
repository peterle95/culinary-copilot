'use client';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useEffect, useState} from 'react';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: 'VR Chef',
    email: 'vr.chef@example.com',
    experience: '5 years',
    dietaryPreferences: 'None',
    location: 'Virtual Kitchen',
  });

  useEffect(() => {
    // Simulate fetching user data
    setTimeout(() => {
      setProfileData({
        name: 'VR Chef',
        email: 'vr.chef@example.com',
        experience: '5 years',
        dietaryPreferences: 'None',
        location: 'Virtual Kitchen',
      });
    }, 500);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md bg-background border-border shadow-md rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold tracking-tight">User Profile</CardTitle>
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://picsum.photos/100/100" alt="User Avatar"/>
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
          </div>
          <CardDescription>Manage your profile information and settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-[100px_1fr] gap-x-4">
                  <span className="text-right font-semibold">Name:</span>
                  <span>{profileData.name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-x-4">
                  <span className="text-right font-semibold">Email:</span>
                  <span>{profileData.email}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Cooking Details</h3>
              <div className="grid gap-2">
                <div className="grid grid-cols-[150px_1fr] gap-x-4">
                  <span className="text-right font-semibold">Experience:</span>
                  <span>{profileData.experience}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-x-4">
                  <span className="text-right font-semibold">Dietary Preferences:</span>
                  <span>{profileData.dietaryPreferences}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-x-4">
                  <span className="text-right font-semibold">Location:</span>
                  <span>{profileData.location}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
