import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "İplikçi Finance",
  description: "İplikçi Finance",
});

const IplikciFinance: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">İplikçi Finance</h1>
        <p className="text-neutral">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut doloremque ducimus qui. Necessitatibus ipsum
          molestiae explicabo quo exercitationem nam nihil atque architecto delectus facere, quos excepturi eos unde.
          Aperiam, sequi!
        </p>
      </div>
    </>
  );
};

export default IplikciFinance;
