import React from "react";

export const Canvas = ({ children }: { children: React.ReactNode }) => {
    return <canvas data-mock="canvas">{children}</canvas>;
};
