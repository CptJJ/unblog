import Crawler from "./components/crawler";

export default function Page() {
  const action = async () => {
    console.log("action");
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <Crawler />
    </div>
  );
}
