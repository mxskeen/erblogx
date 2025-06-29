import React from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BrainCircuit,
  FileSearch,
  Ghost,
  Paperclip,
  Podcast,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiModelsOption } from "@/services/Shared";

function ChatInputBox() {
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
                className="w-full p-4 outline-none"
              ></input>
            </TabsContent>
            <TabsContent value="Deeper Search">
              <input
                type="text"
                placeholder="Deeper Search"
                className="w-full p-4 outline-none"
              ></input>
            </TabsContent>
            <TabsList>
              <TabsTrigger value="Search">
                <Search />
                Search
              </TabsTrigger>
              <TabsTrigger value="Deeper Search">
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
                {AiModelsOption.map((model,index)=>(
                  <DropdownMenuItem key = {index}>
                    <div>
                      <h2 className="mb-1 text-bold">
                        {model.name}
                      </h2>
                      <p className="text-xs">{model.desc}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
             
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost">
              <Paperclip />
            </Button>
            <Button>
              <Podcast className="rounded-full color-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
