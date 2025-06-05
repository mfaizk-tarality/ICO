import React from "react";
import ReactPlayer from "react-player/lazy";
import LoadingScreen from "../LoadingScreen";

const Video = () => {
  return (
    <div className="w-full flex items-center justify-center flex-col py-10">
      <p className="text-4xl text-center text-white font-medium">
        How To Buy TAN
      </p>

      <div className="mt-10">
        <ReactPlayer
          fallback={<LoadingScreen className={"w-full"} />}
          width={"100%"}
          loop
          controls
          url="https://tannetwork.blr1.cdn.digitaloceanspaces.com/How%20to%20Buy%20TAN.mp4"
        />
      </div>
    </div>
  );
};

export default Video;
