// app/(main)/cursos/components/course-list.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Course } from "@prisma/client";
import { PlayCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getYoutubeVideoId, getYoutubeThumbnailUrl, getYoutubeEmbedUrl } from "@/lib/youtube";

interface CourseListProps {
  courses: Course[];
}

export const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => {
          const videoId = getYoutubeVideoId(course.youtubeUrl);
          if (!videoId) return null; // Não renderiza o card se a URL for inválida

          const thumbnailUrl = getYoutubeThumbnailUrl(videoId);

          return (
            <Card
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="overflow-hidden cursor-pointer group transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <CardHeader className="p-0 relative">
                <Image
                  src={thumbnailUrl}
                  alt={course.title}
                  width={400}
                  height={225}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white/80"/>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="mt-2">{course.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal para exibir o vídeo */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl p-0 border-0">
            {selectedCourse && getYoutubeVideoId(selectedCourse.youtubeUrl) && (
                <div className="aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(getYoutubeVideoId(selectedCourse.youtubeUrl)!)}
                        title={selectedCourse.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
};