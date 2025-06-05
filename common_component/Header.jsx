"use client";
import { useAppKit } from "@reown/appkit/react";
import { IconBrandSlack } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { useAccount } from "wagmi";

const navItems = [
  // {
  //   label: "Validator Pool",
  //   href: "#",
  //   children: [
  //     {
  //       label: "Pools",
  //       href: "/validator-pool/pools",
  //     },
  //     {
  //       label: "Completed pools",
  //       href: "/validator-pool/completed-pool",
  //     },
  //     {
  //       label: "My stake",
  //       href: "/validator-pool/my-stakes",
  //     },
  //   ],
  // },
  {
    label: "Home",
    href: "/ico",
  },
  {
    label: "About",
    href: "#",
  },
  {
    label: "Blog",
    href: "#",
  },
  {
    label: "Contact",
    href: "#",
  },
  {
    label: "Privacy Policy",
    href: "#",
  },
  {
    label: "Terms of Use",
    href: "#",
  },
];

const Header = () => {
  const { open, close } = useAppKit();
  const pathname = usePathname();
  const { isConnected } = useAccount();

  const connectButton = useMemo(() => {
    if (!isConnected) {
      return (
        <button
          className="btn bg-tancolor rounded-sm border-0"
          onClick={() => {
            open({ view: "Connect" });
          }}
        >
          <IconBrandSlack />
          <p>Connect Wallet</p>
        </button>
      );
    }
    return <appkit-button />;
  }, [isConnected]);

  const renderNavItem = (item, isMobileDropdown = false) => {
    if (item.children) {
      return (
        <li key={item.label}>
          {isMobileDropdown ? (
            <>
              <Link href={item?.href}>{item.label}</Link>
              <ul className={`${pathname == item.href ? "font-bold" : ""} p-2`}>
                {item.children.map((child) => renderNavItem(child, true))}
              </ul>
            </>
          ) : (
            <details className="dropdown dropdown-hover">
              <summary>{item.label}</summary>
              <ul className="p-2 dropdown-content z-[1] bg-background rounded-box w-52">
                {item.children.map((child) => renderNavItem(child))}
              </ul>
            </details>
          )}
        </li>
      );
    } else {
      return (
        <li
          key={item.label}
          className={`${pathname == item.href ? "font-bold" : ""} `}
        >
          <Link href={item.href}>{item.label}</Link>
        </li>
      );
    }
  };

  return (
    <div className="navbar bg-background">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-background rounded-box z-[1] mt-3 w-52 p-2"
          >
            {navItems.map((item) => renderNavItem(item, true))}
          </ul>
        </div>
        <Link href={"/"}>
          <img
            src="/assets/brand/logo.svg"
            alt=""
            className="h-6 md:h-8 cursor-pointer"
          />
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex min-w-fit 2xl:gap-10">
        <ul className="menu menu-horizontal px-1 2xl:gap-10">
          {navItems.map((item) => renderNavItem(item))}
        </ul>
      </div>
      <div className="navbar-end flex">{connectButton}</div>
    </div>
  );
};

export default Header;
