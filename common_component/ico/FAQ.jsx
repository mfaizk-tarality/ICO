import { useRef } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { cn } from "@/lib/utils";
import { IconPlus } from "@tabler/icons-react";

const faqData = [
  {
    title: "What is the TAN Super Seed Sale?",
    subtitle:
      "The TAN Super Seed Sale is an exclusive early investment round for the TAN token, offering investors a chance to acquire TAN tokens at the lowest possible price before public sales or listings.",
  },
  {
    title: "What cryptocurrencies are accepted for payment?",
    subtitle:
      "Payments will be accepted in popular cryptocurrencies such as USDT, USDC and BNB. Right now USDT & USDC are supported only on BEP-20 Network.",
  },
  {
    title: "Is there a minimum or maximum investment limit?",
    subtitle: `Yes, a minimum amount of $50 is required to participate in the Super Seed Sale. However, there is no maximum limit for investing. Investors will receive a 25% bonus above a $2500 investment.`,
  },
  {
    title: "How is the bonus calculated?",
    subtitle:
      "If you invest more than $2500, you will receive a 25% bonus, but only on the amount that exceeds $2500. For example, if you invest $3000, the bonus will be calculated on the extra $500, meaning you will receive an additional 25% of that amount as a bonus.",
  },
  {
    title: "When will the Super Seed Sale end?",
    subtitle:
      "The Super Seed Sale will end once all 500,000,000 TAN tokens are sold. Investors are encouraged to participate early to secure their tokens before the supply runs out.",
  },
];

const Faq = () => {
  return (
    <div className="w-full flex items-center justify-center mb-20">
      <div className="mt-8 w-5xl">
        <div className="w-full flex items-center justify-center">
          <p className="text-5xl text-center text-white font-semibold">FAQ</p>
        </div>
        <div className="  min-h-56 flex flex-col items-center mt-2 rounded-lg  w-full py-4">
          {faqData.map((item, idx) => (
            <Disclosure
              as="div"
              className={`p-4 ${
                idx === faqData.length - 1
                  ? "border-0"
                  : "border-b border-b-[#ffffff50]"
              } w-[100%]`}
              key={idx}
            >
              {({ open }) => (
                <>
                  <DisclosureButton className="group flex w-full items-center justify-between cursor-pointer py-4 text-start">
                    <div className="flex items-start justify-between w-full">
                      <span className="text-base font-medium text-white group-hover:text-white">
                        {item.title}
                      </span>
                      <IconPlus
                        className={cn(
                          "text-[#be2774] transition-transform duration-300",
                          open && "rotate-180"
                        )}
                      />
                    </div>
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 text-sm/5 text-white/50">
                    {item.subtitle}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
