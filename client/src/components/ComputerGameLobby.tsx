import React,{ useEffect } from "react";
import VsComputerLobby from "./ComputerGame";
import { useWebSocket } from "./GWebSocketProvider";

const ComputerGameLobby:React.FC = () =>{
    const {socket} = useWebSocket()
    console.log(socket);
    useEffect(()=>{
        return () => {
            socket?.close();
        }
    })
    return(
        <VsComputerLobby />
    )
}

export default ComputerGameLobby;