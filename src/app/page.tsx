'use client';

import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {IdentifyIngredient} from '@/components/identify-ingredient';
import {RecipeAssistant} from '@/components/recipe-assistant';
import {Timer} from '@/components/timer';
import {useState} from 'react';

export default function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const handleIngredientIdentified = (ingredient: string) => {
    setSelectedIngredients(prev => [...prev, ingredient]);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader className="m-2">
            <div className="flex items-center space-x-2">
              <Image
                src="https://picsum.photos/50/50"
                alt="Culinary Copilot Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
              <h2 className="font-semibold text-lg">Culinary Copilot</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span className="mr-2">Identify Ingredients</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span className="mr-2">Timer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="outline">Settings</Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-4">
          <div className="space-y-4">
            <section>
              <IdentifyIngredient onIngredientIdentified={handleIngredientIdentified} />
            </section>
            <section>
              <RecipeAssistant ingredients={selectedIngredients} />
            </section>
            <section>
              <Timer />
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

