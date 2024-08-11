"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { ArrowsClockwise } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import { crawlSite } from "../actions";

export default function Crawler() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState<string>("");

  const { mutate, isPending, mutateAsync } = useMutation({
    mutationFn: () => {
      return crawlSite({ url: `https://${url}` });
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  const action = async () => {
    const response = await mutateAsync();

    const processedContent = await remark()
      .use(html)
      .process(response?.data ?? "");
    const contentHtml = processedContent.toString();
    setContent(contentHtml);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>Enter your website URL</CardTitle>

        <div className="flex w-full max-w-sm items-center ">
          <p className=" flex h-9 w-fit items-center justify-center rounded-none border border-input bg-transparent px-3 py-1 text-sm shadow-sm text-muted-foreground -mr-[1px] ">
            https://
          </p>
          <Input
            type="email"
            placeholder="google.com"
            prefix="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button type="submit" onClick={action} disabled={isPending}>
            {isPending ? (
              <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Crawl
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-zinc dark:prose-invert prose-sm"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}
