import React, { useState } from "react";

import { useIcon } from "../../floro_infra/contexts/icons/FloroIconsProvider";
import { useFloroLocales } from "../../floro_infra/contexts/text/FloroLocalesContext";

const LanguageSelect = () => {
  const [isHovered, setIsHovered] = useState(false);

  const langIcon = useIcon(
    "front-page.language",
    isHovered ? "hovered" : undefined
  );
  const dropdownIcon = useIcon(
    "front-page.drop-down-arrow",
    isHovered ? "hovered" : undefined
  );

  const { selectedLocaleCode, setSelectedLocaleCode } = useFloroLocales();

  return (
    <div className={"ls-wrapper"} onMouseLeave={() => setIsHovered(false)}>
      <div
        className={"image-wrapper"}
        onMouseEnter={() => setIsHovered(true)}
      >
        <img className={"icon"} src={langIcon} />
        <img className={"icon"} src={dropdownIcon} />
      </div>
      <div
        style={{
          display: isHovered ? "block" : "none",
        }}
        className={"container"}
      >
        <div className={"outer"}>
          <div className={"inner"}>
            <p
              style={{
                fontWeight: selectedLocaleCode == "EN" ? 600 : 400,
              }}
              className={"lang-option"}
              onClick={() => {
                setSelectedLocaleCode("EN");
              }}
            >
              {"English"}
            </p>
            <p
              style={{
                fontWeight: selectedLocaleCode == "ES" ? 600 : 400,
              }}
              className={"lang-option"}
              onClick={() => {
                setSelectedLocaleCode("ES");
              }}
            >
              {"Español"}
            </p>
            <p
              style={{
                fontWeight: selectedLocaleCode == "ZH" ? 600 : 400,
              }}
              className={"lang-option"}
              onClick={() => {
                setSelectedLocaleCode("ZH");
              }}
            >
              {"简体中文"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LanguageSelect);
