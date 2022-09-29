const images: HTMLImageElement[] = [];
const n1 = 3;
const n2 = Math.pow(2, n1);

const imageSources: string[] = [
  "../assets/image1.jpg",
  "../assets/image2.jpg",
  "../assets/image3.jpg",
  "../assets/image4.jpg",
  "../assets/image5.jpg",
  "../assets/image6.jpg",
  "../assets/image7.jpg",
  "../assets/image8.jpg",
];

function getMasks() {
  const bin: boolean[][] = [];
  for (let i = 0; i < n2; i++) {
    bin.push(
      Array.from(i.toString(2).padStart(n1, "0")).map((char) => char == "1")
    );
  }
  return bin
    .map((el) =>
      el
        .map((bool, index) => ({ bool, index }))
        .filter((el) => el.bool)
        .map((el) => el.index)
    )
    .sort((a, b) => {
      if (a.length < b.length) return -1;
      if (a.length > b.length) return 1;
      for (let i = 0; i < a.length; i++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
      }
      return 0;
    });
}

const masks = getMasks();

function getStartingPoints() {
  const points: IPoint[] = [];
  for (let i = 0; i < n1; i++) {
    points.push({
      x: 100 + 100 * i,
      y: 100,
    });
  }
  return points;
}

type IPointData = {
  current: IPoint;
  start: IPoint | null;
};

const points: IPointData[] = [];

const radius = 200;

interface IPoint {
  x: number;
  y: number;
}

function calculateDistance(pointA: IPoint, pointB: IPoint) {
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
  );
}

const selected: IPointData[] = [];

let startPanningPoint: IPoint | null = null;

window.addEventListener("load", function () {
  init();
  initCreditsButton();
  console.log(":");
});

const canvases: HTMLCanvasElement[] = [];
let body: HTMLElement | null;

async function init() {
  body = document.getElementById("images");
  images.push(
    ...imageSources.map((src) => {
      const image = document.createElement("img");
      image.hidden = true;
      image.width = body?.clientWidth || 100;
      image.height = body?.clientHeight || 100;
      image.src = src;
      return image;
    })
  );

  await Promise.all(
    images.map((el) => new Promise((res) => (el.onload = res)))
  );

  body?.addEventListener("mousedown", (event) => {
    startPanningPoint = {
      x: event.x,
      y: event.y,
    };
    if (points)
      selected.push(
        ...points.filter(
          (point) => calculateDistance(point.current, event) < radius
        )
      );
    selected.forEach((el) => (el.start = { ...el.current }));
  });
  body?.addEventListener("mousemove", (event) => {
    selected.forEach((point) => {
      if (!point.start || !startPanningPoint) return;
      point.current.x = point.start.x + event.x - startPanningPoint.x;
      point.current.y = point.start.y + event.y - startPanningPoint.y;
    });
    if (selected.length) render();
  });

  body?.addEventListener("mouseup", (event) => {
    selected.forEach((el) => (el.start = null));
    selected.splice(0);
  });

  for (let i = 0; i < n2; i++) {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    body?.appendChild(canvas);
    canvases.push(canvas);
  }
  render();
}

function render() {
  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const context = canvas.getContext("2d");
    if (context && body) {
      canvas.width = body.clientWidth;
      canvas.height = body.clientHeight;

      const center: IPoint = {
        x: canvas.width / 2,
        y: canvas.height / 2,
      };
      const diameter = 100;
      if (!points.length) {
        const part = (2 * Math.PI) / n1;
        for (let i = 0; i < n1; i++) {
          points.push({
            current: {
              x: center.x + diameter * Math.cos(part * i),
              y: center.y + diameter * Math.sin(part * i),
            },
            start: null,
          });
        }
      }

      context.drawImage(images[i], 0, 0, canvas.width, canvas.height);

      masks[i].forEach((index) => {
        const point = points[index];
        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(
          point.current.x,
          point.current.y,
          radius,
          0,
          2 * Math.PI,
          false
        );
        context.fill();
        context.globalCompositeOperation = "destination-atop";
      });
    }
  }
}

function initCreditsButton() {
  const creditsButton = document.getElementsByClassName("credits-button");
  Array.from(creditsButton).forEach((el) => {
    el.addEventListener("click", () => {
      const credits = document.getElementsByClassName("credits");
      Array.from(credits).forEach((el) => {
        const el1 = el as HTMLElement;
        el1.style.display = el1.style.display == "block" ? "none" : "block";
      });
    });
  });
}
