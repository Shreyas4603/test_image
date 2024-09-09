import { useRef, useState, useEffect } from "react";
import "./App.css";

function App() {
  const [points, setPoints] = useState([]); // Stores the clicked points
  const [displayedSize, setDisplayedSize] = useState({
    width: 640,
    height: 480,
  }); // Dynamically track image size
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [polygonClosed, setPolygonClosed] = useState(false);

  const images = [
    { name: "src/grid_coords_426x240.png", width: 426, height: 240 },
    { name: "src/grid_coords_640x360.png", width: 640, height: 360 },
    { name: "src/grid_coords_854x480.png", width: 854, height: 480 },
    { name: "src/grid_coords_1280x720.png", width: 1280, height: 720 },
    { name: "src/grid_coords_1920x1080.png", width: 1920, height: 1080 },
    { name: "src/grid_coords_2560x1440.png", width: 2560, height: 1440 },
    { name: "src/grid_coords_3840x2160.png", width: 3840, height: 2160 },
  ];

  const workingImage = images[2]; // Use index 2 as the working image
  const originalSize = {
    width: workingImage.width,
    height: workingImage.height,
  };
  const gravityThreshold = 5;

  // Scale the clicked point to the original image size
  const scaleToOriginal = (x, y, currentSize) => {
    const scaleX = originalSize.width / currentSize.width;
    const scaleY = originalSize.height / currentSize.height;
    return { x: x * scaleX, y: y * scaleY };
  };

  // Function to draw the polygon based on the points

  // Handle image click and scale the points
  const handleImageClick = (e) => {
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaledPoint = scaleToOriginal(x, y, displayedSize);

    setPoints((prevPoints) => {
      const updatedPoints = [...prevPoints, scaledPoint];
      drawAllLines(updatedPoints); // Redraw lines on each click
      return updatedPoints;
    });
  };

  // Update displayed size when window resizes or image loads
  const updateImageSize = () => {
    const img = imgRef.current;
    if (img) {
      const rect = img.getBoundingClientRect();
      setDisplayedSize({ width: rect.width, height: rect.height });
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      img.onload = updateImageSize;
      window.addEventListener("resize", updateImageSize);
      return () => window.removeEventListener("resize", updateImageSize);
    }
  }, []);

  // Update canvas size and redraw lines after image load or resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = displayedSize.width;
      canvas.height = displayedSize.height;
      drawAllLines(points);
    }
    try {
      if (polygonClosed) drawPolygon(points);
    } catch (error) {}
  }, [displayedSize, points]);

  // Scale a point from original size to displayed size
  const scaleToDisplayed = (x, y) => {
    const scaleX = displayedSize.width / originalSize.width;
    const scaleY = displayedSize.height / originalSize.height;
    return { x: x * scaleX, y: y * scaleY };
  };

  // Draw a line between two points
  const drawLine = (start, end) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const startDisplay = scaleToDisplayed(start.x, start.y);
    const endDisplay = scaleToDisplayed(end.x, end.y);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startDisplay.x, startDisplay.y);
    ctx.lineTo(endDisplay.x, endDisplay.y);
    ctx.stroke();
  };

  // Redraw all lines between points
  const drawAllLines = (points) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing
    for (let i = 0; i < points.length - 1; i++) {
      drawLine(points[i], points[i + 1]);
    }
  };

  // Function to draw and fill the polygon based on the points
  const drawPolygon = (points) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing

    ctx.strokeStyle = "blue"; // Outline color for the polygon
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Fill color with opacity
    ctx.lineWidth = 2;

    ctx.beginPath();
    // Move to the first point
    const firstPoint = scaleToDisplayed(points[0].x, points[0].y);
    ctx.moveTo(firstPoint.x, firstPoint.y);

    // Draw lines between all points
    for (let i = 1; i < points.length; i++) {
      const point = scaleToDisplayed(points[i].x, points[i].y);
      ctx.lineTo(point.x, point.y);
    }

    // Close the polygon if the last point is close enough to the first
    const lastPoint = points[points.length - 1];
    const distance = Math.sqrt(
      Math.pow(lastPoint.x - points[0].x, 2) +
        Math.pow(lastPoint.y - points[0].y, 2)
    );
    if (distance < gravityThreshold) {
      ctx.lineTo(firstPoint.x, firstPoint.y); // Close the polygon
    }

    ctx.closePath();
    ctx.fill(); // Fill the polygon with color
    ctx.stroke(); // Draw the polygon outline
  };

  // Modify the calculateDistance function to trigger drawPolygon when closing the polygon
  const calculateDistance = (points) => {
    console.log("points in calc ", points);
    const n = points.length;
    if (n < 2) return;

    const lastPoint = points[n - 1];

    // const distance = Math.sqrt(
    //   Math.pow(lastPoint.x - secondLastPoint.x, 2) + Math.pow(lastPoint.y - secondLastPoint.y, 2)
    // );

    const distanceToOriginal = Math.sqrt(
      Math.pow(lastPoint.x - points[0].x, 2) +
        Math.pow(lastPoint.y - points[0].y, 2)
    );
    console.log("distance", distanceToOriginal);

    if (distanceToOriginal < gravityThreshold) {
      // console.log("distance in if",distanceToOriginal)
      setPolygonClosed(true);
      points[n - 1] = points[0]; // Snap the last point to the first point to close the polygon
      drawPolygon(points); // Draw and fill the polygon
    }
  };
  useEffect(() => {
    calculateDistance(points);
  }, [points]);

  useEffect(() => {
    console.log("points", points);
  }, [points]);

  // Circle component for displaying the red circle
  const Circle = ({ x, y }) => {
    const { x: scaledX, y: scaledY } = scaleToDisplayed(x, y);
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
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  };

  return (
    <div className="relative grid grid-cols-4 bg-red-900 h-screen w-full">
      <div className="relative w-full col-span-3">
        <img
          ref={imgRef}
          src={workingImage.name}
          alt="Polygon Drawing"
          className="w-full"
        />
        <canvas
          className="absolute inset-0 z-10"
          ref={canvasRef}
          onClick={handleImageClick}
        />
        {points.map((point, index) => (
          <Circle key={index} x={point.x} y={point.y} />
        ))}
      </div>

      <div className="w-full bg-slate-800 text-white p-4">
        <h3>{workingImage.name}</h3>
        <h3>Points:</h3>
        {points.map((point, index) => (
          <div key={index}>
            Point {index + 1}: (X: {point.x.toFixed(2)}, Y: {point.y.toFixed(2)}
            )
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
