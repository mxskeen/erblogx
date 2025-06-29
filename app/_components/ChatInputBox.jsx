"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  ArrowRight,
  BrainCircuit,
  FileSearch,
  Ghost,
  Paperclip,
  Podcast,
  Search,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { AiModelsOption } from "../../services/Shared";
import { supabase } from "../../services/supabase";
import { useUser } from "@clerk/nextjs";
import { v4 as uuid } from "uuid";

function ChatInputBox() {
  const [userSearchInput, setUserSearchInput] = useState();
  const { user } = useUser();
  const [searchType, setSearchType] = useState("search");
  const [loading, setLoading] = useState(false);

  const onSearchQuery = async () => {
    setLoading(true);
    const libId = uuid();
    const { data, error } = await supabase.from("Library").insert([
      {
        searchInput: userSearchInput,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        type: searchType,
        libId: libId,
      },
    ]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchQuery();
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center w-full">
      <Image src="/logo.png" alt="logo" width={300} height={250} />
      <div className="p-2 w-full max-w-2xl border rounded-2xl -mt-2">
        <div className="flex justify-between items-end">
          <Tabs defaultValue="Search" className="w-[400px]">
            <TabsContent value="Search">
              <input
                type="text"
                placeholder="Search Over Engineering Blogs"
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="w-full p-4 outline-none"
                onKeyDown={handleKeyDown}
              ></input>
            </TabsContent>
            <TabsContent value="Deeper Search">
              <input
                type="text"
                placeholder="Deeper Search"
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="w-full p-4 outline-none"
                onKeyDown={handleKeyDown}
              ></input>
            </TabsContent>
            <TabsList>
              <TabsTrigger
                value="Search"
                className={"text-primary"}
                onClick={() => setSearchType("Search")}
              >
                <Search />
                Search
              </TabsTrigger>
              <TabsTrigger
                value="Deeper Search"
                className={"text-primary"}
                onClick={() => setSearchType("Deep")}
              >
                <FileSearch />
                Deep Search
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2.5 items-center rounded-full color-primary">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost">
                  <BrainCircuit />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                {AiModelsOption.map((model, index) => (
                  <DropdownMenuItem key={index}>
                    <div>
                      <h2 className="mb-1 text-bold">{model.name}</h2>
                      <p className="text-xs">{model.desc}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost">
              <Paperclip />
            </Button>
            <Button onClick={onSearchQuery}>
              {!userSearchInput ? (
                <Podcast className="rounded-full color-primary" />
              ) : (
                <ArrowRight className='text-white' disabled={loading}/>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
