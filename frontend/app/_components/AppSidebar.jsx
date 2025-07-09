'use client';

import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "../../components/ui/sidebar"
import Image from 'next/image'
import { Home, Compass, GalleryHorizontalEnd, LogIn, Linkedin, Github } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import ConfirmSignOutButton from "./ConfirmSignOutButton";

const MenuOptions = [
  {
    label: "Home",
    icon: Home,
    path: "/",
  },
  {
    label: "Discovery",
    icon: Compass,
    path: "/discover",
  },
  {
    label: "Library",
    icon: GalleryHorizontalEnd,
    path: "/lib",
  },
];

function AppSidebar () {
  const path = usePathname();
  const { user } = useUser();
  
  return (
    <Sidebar>
      <SidebarHeader className="bg-purple-50 flex items-center py-3 sm:py-5">
        <a href="/">
          <Image 
            src="/logo.png" 
            alt="logo" 
            width={180} 
            height={140} 
            className="w-36 h-auto sm:w-44 md:w-48"
          />
        </a>
      </SidebarHeader>

      <SidebarContent className="bg-purple-50">
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {MenuOptions.map((menu, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton 
                    asChild 
                    className={`p-3 py-4 sm:p-5 sm:py-6 hover:font-bold hover:bg-transparent text-sm sm:text-base md:text-lg
                    ${(menu.path === '/' ? path === '/' : path?.startsWith(menu.path)) && 'font-bold'}`}
                  >
                    <a href={menu.path}>
                      <menu.icon className='h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8'/>
                      <span className='ml-2 sm:ml-3'> {menu.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!user && (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    className="p-3 py-4 sm:p-5 sm:py-6 hover:font-bold hover:bg-transparent text-sm sm:text-base md:text-lg"
                  >
                    <SignInButton mode="modal">
                      <div className="flex items-center">
                        <LogIn className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"/>
                        <span className="ml-2 sm:ml-3">Sign In</span>
                      </div>
                    </SignInButton>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
            
            <div className="mt-4 px-3 sm:px-5">
              {!user ? (
                <SignUpButton mode='modal'>
                  <Button className='rounded-full w-full text-sm sm:text-base py-2 sm:py-3'>
                    Sign Up
                  </Button>
                </SignUpButton>
              ) : (
                <ConfirmSignOutButton />
              )}
            </div>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-purple-50" >
        <div className="w-full flex flex-col items-center mb-2">
          <span className="text-xs text-gray-500 text-center">ErBlogX : the index for everything engineering</span>
        </div>
        <div className="p-3 flex gap-4 justify-center">
          <a href="https://www.linkedin.com/in/mxskeen/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-200">
              <Linkedin className="h-6 w-6" />
            </Button>
          </a>
          <a href="https://github.com/mxskeen/erblogx" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-200">
              <Github className="h-6 w-6" />
            </Button>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
export default AppSidebar;
