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
import { Github, Linkedin, LogIn, Home, Info } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

const MenuOptions = [
  {
    label:"Home",
    icon:Home,
    path:"/"
  },
  {
    label:"About",
    icon:Info,
    path:"/about"
  }
]

function ConfirmSignOutButton() {
  return (
    <SignOutButton
      onClick={e => {
        if (!window.confirm("Are you sure you want to log out?")) {
          e.preventDefault();
        }
      }}
    >
      <Button className="rounded-full">Log Out</Button>
    </SignOutButton>
  );
}

function AppSidebar () {
  const path=usePathname();
  const { user } =useUser();
  return (
    <Sidebar>
      <SidebarHeader className="bg-purple-50 flex items-center py-5">
        <a href="/">
        <Image src="/logo.png" alt="logo" width={180} height={140} />
        </a>
      </SidebarHeader>

      <SidebarContent className="bg-purple-50">
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {MenuOptions.map((menu, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild 
                  className={`p-5 py-6 hover:font-bold hover:bg-transparent
                  ${(menu.path === '/' ? path === '/' : path?.startsWith(menu.path)) && 'font-bold'}`}>
                    <a href={menu.path}>
                      <menu.icon className='h-8 w-8'/>
                      <span className='text-lg'> {menu.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!user && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="p-5 py-6 hover:font-bold hover:bg-transparent">
                  <SignInButton mode="modal">
                    <div className="flex items-center">
                      <LogIn className="h-8 w-8"/>
                      <span className="text-lg ml-2">SignIn</span>
                    </div>
                  </SignInButton>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )}
            </SidebarMenu>
          {!user ?  <SignUpButton mode='modal'>
              <Button className='rounded-full'>Sign Up</Button>
            </SignUpButton>:
            <ConfirmSignOutButton />}
          </SidebarContent>
        </SidebarGroup>

        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter className="bg-purple-50" >
        <div className="w-full flex flex-col items-center mb-2">
          <span className="text-xs text-gray-500 text-center">ErBlogX : the index for everythiing engineering</span>
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
