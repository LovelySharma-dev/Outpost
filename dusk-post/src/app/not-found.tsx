import Link from "next/link";

export default function NotFound() {
  return (
    <main id="content" className="lost">
      <div className="sheet">
        <p className="eyebrow">Off the route</p>
        <h1>That stop is not on the timetable.</h1>
        <p>Grantly does not have a pass at this address.</p>
        <Link className="button" href="/">
          Back to the route
        </Link>
      </div>
    </main>
  );
}
