'use client'

import React from "react"
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react"
import { Skull } from "lucide-react"

interface LogoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  onPress: () => void;
}

export const LogoCard = ({ id, title, thumbnail, tags, onPress }: LogoCardProps) => {
  return (
    <Card 
      isPressable
      onPress={onPress}
      className="group bg-zinc-900/50 backdrop-blur-sm border border-white/10
                 hover:bg-zinc-900/80 transition-all duration-300"
    >
      <CardBody className="aspect-square p-8">
        <div className="w-full h-full flex items-center justify-center">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              className="w-full h-full object-contain group-hover:brightness-110
                       transition-all duration-300"
            />
          ) : (
            <Skull className="w-12 h-12 opacity-30" />
          )}
        </div>
      </CardBody>
      
      <CardFooter className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t 
                            from-black/80 to-transparent">
        <div className="w-full">
          <h3 className="font-medium text-sm mb-2">{title}</h3>
          <div className="flex gap-2">
            {tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}; 