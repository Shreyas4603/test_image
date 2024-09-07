import { useRef, useState, useEffect } from "react";
import "./App.css";

function App() {
  const [points, setPoints] = useState([]); // stores the clicked points
  const [displayedSize, setDisplayedSize] = useState({
    width: 640,
    height: 480,
  }); // Dynamically track image size
  const imgRef = useRef(null);

  const images = [
    { name: "src/grid_coords_426x240.png", width: 426, height: 240 },
    { name: "src/grid_coords_640x360.png", width: 640, height: 360 },
    { name: "src/grid_coords_854x480.png", width: 854, height: 480 },
    { name: "src/grid_coords_1280x720.png", width: 1280, height: 720 },
    { name: "src/grid_coords_1920x1080.png", width: 1920, height: 1080 },
    { name: "src/grid_coords_2560x1440.png", width: 2560, height: 1440 },
    { name: "src/grid_coords_3840x2160.png", width: 3840, height: 2160 },
  ];

  const workingImage = images[2]; //index-0-6
  const originalSize = {
    width: workingImage.width,
    height: workingImage.height,
  };

  // Scale the clicked point to the original image size
  const scaleToOriginal = (x, y, currentSize) => {
    const scaleX = originalSize.width / currentSize.width;
    const scaleY = originalSize.height / currentSize.height;
    return {
      x: x * scaleX,
      y: y * scaleY,
    };
  };

  // Handle image click and scale the points
  const handleImageClick = (e) => {
    const img = imgRef.current;
    const rect = img.getBoundingClientRect(); // get the image's position on the page
    const x = e.clientX - rect.left; // X coordinate relative to image
    const y = e.clientY - rect.top; // Y coordinate relative to image

    console.log("Original Point:", [x, y]); // Log the original coordinates
    const scaledPoint = scaleToOriginal(x, y, displayedSize); // Scale to original size
    console.log("Scaled Point:", scaledPoint); // Log the scaled coordinates

    setPoints([...points, scaledPoint]); // Store the scaled point
  };

  // Function to update the displayed size when the window resizes
  const updateImageSize = () => {
    const img = imgRef.current;
    if (img) {
      const rect = img.getBoundingClientRect();
      setDisplayedSize({
        width: rect.width,
        height: rect.height,
      });
    }
  };

  // Use useEffect to add an event listener for window resize and update image size
  useEffect(() => {
    updateImageSize(); // Update size on initial load
    window.addEventListener("resize", updateImageSize); // Listen for window resize

    return () => {
      window.removeEventListener("resize", updateImageSize); // Cleanup on component unmount
    };
  }, []);

  // Scale a point from original size to displayed size
  const scaleToDisplayed = (x, y, currentSize) => { 
    const scaleX = currentSize.width / originalSize.width;
    const scaleY = currentSize.height / originalSize.height;
    return {
      x: x * scaleX,
      y: y * scaleY,
    };
  };

  // Circle component for displaying the red circle
  const Circle = ({ x, y }) => {
    const { x: scaledX, y: scaledY } = scaleToDisplayed(x, y, displayedSize);
    return (
      <div
        style={{
          position: "absolute",
          left: `${scaledX}px`,
          top: `${scaledY}px`,
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: "red",
          transform: "translate(-50%, -50%)", // Center the circle
        }}
      />
    );
  };

  return (
    <>
      <div className="relative grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 bg-red-900 h-screen w-full">
        <div className="relative w-full">
          <img
            ref={imgRef}
            src={workingImage.name} // Replace with your image URL
            alt="Polygon Drawing"
            onClick={handleImageClick}
            className="bg-green-800 p-1 w-full"
          />
          {/* Render circles */}
          {points.map((point, index) => (
            <Circle key={index} x={point.x} y={point.y} />
          ))}
        </div>

        <div className="w-full bg-slate-800 text-white">
          {workingImage.name}

          <h3>Points:</h3>
          {points.map((point, index) => (
            <div key={index}>
              Point {index + 1}: (X: {point.x.toFixed(2)}, Y:{" "}
              {point.y.toFixed(2)})
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
