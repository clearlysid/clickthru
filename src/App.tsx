import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow, currentMonitor } from "@tauri-apps/api/window";
import "./App.css";

function App() {
  const clickThroughRef = useRef<HTMLDivElement>(null);
  const nonClickThroughRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let mouseTrackingInterval: number | null = null;
    let scaleFactor = 1;

    async function getMousePosFromRust() {
      const message = await invoke<number[]>("get_mouse_position");
      return message;
    }

    async function initializeScaleFactor() {
      const monitor = await currentMonitor();
      if (monitor) {
        scaleFactor = monitor.scaleFactor;
      }
    }

    async function checkMousePosition() {
      const [mouseX, mouseY] = await getMousePosFromRust();
      let isMouseInsideNonClickThrough = false;

      for (const div of nonClickThroughRefs.current) {
        if (div) {
          const rect = div.getBoundingClientRect();
          const physicalRect = {
            left: rect.left * scaleFactor,
            right: rect.right * scaleFactor,
            top: rect.top * scaleFactor,
            bottom: rect.bottom * scaleFactor,
          };

          if (
            mouseX >= physicalRect.left &&
            mouseX <= physicalRect.right &&
            mouseY >= physicalRect.top &&
            mouseY <= physicalRect.bottom
          ) {
            isMouseInsideNonClickThrough = true;
            break;
          }
        }
      }

      getCurrentWindow().setIgnoreCursorEvents(isMouseInsideNonClickThrough);
    }

    function startMouseTracking() {
      if (mouseTrackingInterval) {
        clearInterval(mouseTrackingInterval);
      }

      checkMousePosition();
      mouseTrackingInterval = window.setInterval(checkMousePosition, 50);
    }

    async function initialize() {
      await initializeScaleFactor();
      startMouseTracking();
    }

    initialize();

    return () => {
      if (mouseTrackingInterval) {
        clearInterval(mouseTrackingInterval);
      }
    };
  }, []);



  return (
    <div className="container">
      <div className="box"
        ref={(el) => el && nonClickThroughRefs.current.push(el)}
      >
        <h1>Welcome to Tauri!</h1>
        <p>You can click through the transparent parts!</p>
      </div>

      <div className="row">
        <div className="box" ref={(el) => el && nonClickThroughRefs.current.push(el)}></div>
        <div className="clickthrough" ref={clickThroughRef}></div>
        <div className="box" ref={(el) => el && nonClickThroughRefs.current.push(el)}></div>
      </div>
      <div className="box"
        ref={(el) => el && nonClickThroughRefs.current.push(el)}
      >
      </div>
    </div>
  );
}

export default App;
