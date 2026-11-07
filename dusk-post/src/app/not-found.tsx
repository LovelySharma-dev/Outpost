import Link from "next/link";

export default function NotFound() {
  return (
    <main id="content" className="lost">
      <div className="sheet">
        <p className="eyebrow">Off the route</p>
        <h1>This sheet was never on the press.</h1>
        <p>Sable checked the rack. That address is not an edition.</p>
        <Link className="button" href="/">
          Back to the proofing table
        </Link>
      </div>
    </main>
  );
}
