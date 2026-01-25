import { useState } from "react";

function SimpleVirtualList({ items, itemHeight, containerHeight }) {
  const [scroll, setScroll] = useState(0);

  const startTop = Math.floor(scroll / itemHeight);
  const startEnd = Math.min(
    items.length - 1,
    Math.floor((scroll + containerHeight) / itemHeight)
  );

  const mainArray = [];

  for (let i = startTop; i <= startEnd; i++) {
    mainArray.push({ data: items[i], index: i });
  }

  return (
    <>
      <div
        onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
        style={{
          position: "relative",
          height: containerHeight,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            height: itemHeight * items.length,
          }}
        />

        {mainArray.map((e) => (
          <div
            style={{
              position: "absolute",
              top: itemHeight * e.index,
              height: itemHeight,
            }}
            key={e.index}
          >
            {e.data.title}
          </div>
        ))}
      </div>
    </>
  );
}

function App() {
  const items = []

  return (
    <SimpleVirtualList items={items} itemHeight={50} containerHeight={400} />
  );
}

export default App;
