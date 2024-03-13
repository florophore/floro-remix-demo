import React from "react";
import { useIcon } from "../../floro_infra/contexts/icons/FloroIconsProvider";
import ThemeSwitcher from "../ThemeSwitcher";
import LanguageSelect from "../LanguageSelect";
import { Link } from "@remix-run/react";

interface Props {
    children?: React.ReactNode;
}

const PageWrapper = (props: Props) => {
    const RoundIcon = useIcon("front-page.floro-round");
    return (
      <div className={"page-wrapper"}>
        <nav className={"page-nav"}>
          <div className={"page-inner-container"}>
            <div className={"nav-content"}>
              <Link to={"/"}>
                <img className={"nav-icon"} src={RoundIcon} />
              </Link>
              <div className={"nav-data"}>
                <div/>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                    <ThemeSwitcher/>
                    <LanguageSelect/>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className={"scroll-wrapper"}>
            <div className={"main-content"}>
                {props.children}
            </div>
        </div>
      </div>
    );

}

export default React.memo(PageWrapper);