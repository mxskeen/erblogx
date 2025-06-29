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
import { ArrowUpRight, Compass, GalleryHorizontalEnd, LogIn, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

const MenuOptions = [
  {
    label:"Home",
    icon:Search,
    path:"/"
  },
  {
    label: "Discovery",
    icon:Compass,
    path:"/discover"
  },
  {
    label:"Library",
    icon:GalleryHorizontalEnd,
    path:"/lib"
  }
]
function AppSidebar () {
  const path=usePathname();
  const { user } =useUser();
  return (
    <Sidebar>
      <SidebarHeader className="bg-accent flex items-center py-5">
        <Image src="/logo.png" alt="logo" width={180} height={140} />
      </SidebarHeader>

      <SidebarContent className="bg-accent">
        <SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              {MenuOptions.map((menu, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild 
                  className={`p-5 py-6 hover:font-bold hover:bg-transparent
                  ${path?.includes(menu.path)&&'font-bold'}`}>
                    <a href={menu.path}>
                      <menu.icon className='h-8 w-8'/>
                      <span className='text-lg'> {menu.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            </SidebarMenu>
          {!user?  <SignUpButton mode='modal'>
              <Button className='rounded-full'>Sign Up</Button>
            </SignUpButton>:
            <SignOutButton>
              <Button className='rounded-full'>Log Out</Button>
            </SignOutButton>}
          </SidebarContent>
        </SidebarGroup>

        <SidebarGroup />
      </SidebarContent>

      <SidebarFooter className="bg-accent" >
        <div className='p-3 flex flex-col'>
          <Button variant='secondary' className= 'rounded-full' >Learn More</Button>
          <UserButton className='height-10 width-10' />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
export default AppSidebar;
