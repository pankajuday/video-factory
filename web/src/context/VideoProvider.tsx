import React, { createContext, useReducer, useContext, type ReactNode } from "react";
import type { VideoDetails } from "../Types";


type State = {
    videos: VideoDetails[];
}

type Action =
    | { type: "ADD_VIDEO"; payload: VideoDetails }
    | { type: "REMOVE_VIDEO"; payload: string }
    | { type: "CLEAR_VIDEOS" };

const initialState: State = {
  videos: [],
};

const VideoContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
} | null>(null);

function videoReducer(state: State, action: Action): State {
    switch (action.type) {
        case "ADD_VIDEO":
            // Always keep only the latest video
            return { ...state, videos: [action.payload] };

        case "REMOVE_VIDEO":
            return {
                ...state,
                videos: state.videos.filter(v => v._id !== action.payload),
            };

        case "CLEAR_VIDEOS":
            return { ...state, videos: [] };

        default:
            return state;
    }
}

export const VideoProvider = ({children}: {children: ReactNode}) =>{
    const [state, dispatch] = useReducer(videoReducer, initialState);
    return (
        <VideoContext.Provider value={{state, dispatch}}>
            {children}
        </VideoContext.Provider>
    )
}

export const useVideoContext = ()=>{
    const context = useContext(VideoContext);
    if(!context){
        throw new Error("useVideoContext must be used within VideoProvider");
    }

    return context;
}