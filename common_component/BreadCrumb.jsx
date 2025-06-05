import Link from "next/link";
import React from "react";

const BreadCrumb = ({ routes = [] }) => {
  return (
    <div className="breadcrumbs text-sm my-4">
      <ul>
        {routes?.map((item, idx) => {
          return (
            <li key={idx}>
              <Link href={item?.href}>{item.text}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BreadCrumb;
