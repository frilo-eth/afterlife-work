'use client'

import React from "react"
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react"
import { Skull } from "lucide-react"
import { motion } from "framer-motion"

interface LogoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  onClick: () => void;
}

export const LogoCard = ({ id, title, thumbnail, tags, onClick }: LogoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        isPressable
        onPress={onClick}
        className="group bg-zinc-900/50 backdrop-blur-sm border border-white/10
                   hover:bg-zinc-900/80 transition-all duration-300"
      >
        <CardBody className="aspect-square p-8">
          <div className="w-full h-full flex items-center justify-center">
            {thumbnail ? (
              <div className="relative w-full h-full">
                <Image
                  src={thumbnail}
                  alt={title}
                  classNames={{
                    img: "w-full h-full object-contain group-hover:brightness-110 transition-all duration-300"
                  }}
                  loading="lazy"
                  onError={() => {
                    // Handle image load error
                    console.log('Image failed to load');
                  }}
                />
              </div>
            ) : (
              <Skull className="w-12 h-12 opacity-30" />
            )}
          </div>
        </CardBody>
        
        <CardFooter className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t 
                              from-black/80 to-transparent">
          <div className="w-full">
            <motion.h3 
              className="font-medium text-sm mb-2"
              layout
            >
              {title}
            </motion.h3>
            <div className="flex gap-2">
              {tags.slice(0, 2).map(tag => (
                <motion.span 
                  key={tag} 
                  className="text-xs px-2 py-1 rounded-full bg-white/10"
                  layout
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}; 