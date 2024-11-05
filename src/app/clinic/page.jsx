import Clinic1 from "../clinic/clinic1/page";
import Clinic2 from "../clinic/clinic2/page";

export default function Clinic() {
  return (
    <div
      id="clinic"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 mt-36"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Use Clinic1 and Clinic2 Components */}
        <Clinic1 />
        <Clinic2 />
      </div>
    </div>
  );
}
