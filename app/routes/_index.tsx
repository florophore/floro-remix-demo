import React from "react";
import { Link } from "@remix-run/react";
import PageWrapper from "~/components/PageWrapper";
import { useIcon } from "~/floro_infra/contexts/icons/FloroIconsProvider";
import { useRichText } from "~/floro_infra/hooks/text";

const Home = () => {
    const FloroIcon = useIcon("main.floro");
    const FloroTextIcon = useIcon("main.floro-text");

    const WelcomeToFloroDemo = useRichText("demo_page.welcome_to_floro_demo");
    const EditAppCode = useRichText("demo_page.edit_app_code");
    const StringExamples = useRichText("demo_page.string_examples");
    const ReadTheDocs = useRichText("demo_page.read_the_docs");
    return (
    <PageWrapper>
      <div className={"main-wrapper"}>
        <img className={'floro-icon'} src={FloroIcon}/>
        <img className={'floro-icon-text'} src={FloroTextIcon}/>
      </div>
      <div className={'text-wrapper'}>
        <p className={'welcome-banner'}>
          <WelcomeToFloroDemo/>
        </p>
        <p className={'demo-code-text'}>
          <EditAppCode sourcePath={`app/routes/_index.tsx`}/>
        </p>
      </div>
      <div className={'link-wrapper'}>
        <a target="_blank" className={'link'} href="https://floro.io/docs">
          <ReadTheDocs/>
        </a>
        <Link style={{marginTop: 24}} className={'link'} to="/string-examples">
          <StringExamples/>
        </Link>
      </div>
    </PageWrapper>
    )
}

export default React.memo(Home);