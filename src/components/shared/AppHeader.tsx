import React from "react";
import styled from "styled-components";
import { IconButton, AppsMenu } from "grindery-ui";
import useAppContext from "../../hooks/useAppContext";
import Logo from "./Logo";
import { GRINDERY_APPS, ICONS, SCREEN } from "../../constants";
import useWindowSize from "../../hooks/useWindowSize";
import { useMatch, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import WorkspaceSelector from "./WorkspaceSelector";
import { useGrinderyNexus } from "use-grindery-nexus";

const Wrapper = styled.div`
  border-bottom: 1px solid #dcdcdc;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
  position: fixed;
  background: #ffffff;
  width: 435px;
  max-width: 100vw;
  box-sizing: border-box;
  z-index: 1201;
  @media (min-width: ${SCREEN.TABLET}) {
    width: 100%;
    top: 0;
    max-width: 100%;
  }
`;

const UserWrapper = styled.div`
  margin-left: 0;
  order: 4;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
  }
`;

const CloseButtonWrapper = styled.div`
  & .MuiIconButton-root img {
    width: 16px !important;
    height: 16px !important;
  }

  @media (min-width: ${SCREEN.TABLET}) {
    margin-left: 0;
    margin-right: 8px;
    order: 1;
  }
`;

const LogoWrapper = styled.div`
  order: 1;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 2;
  }
`;

const CompanyNameWrapper = styled.div`
  display: none;
  @media (min-width: ${SCREEN.TABLET}) {
    display: block;
    order: 3;
    font-weight: 700;
    font-size: 16px;
    line-height: 110%;
    color: #0b0d17;
    cursor: pointer;
  }
`;

const BackWrapper = styled.div`
  & img {
    width: 16px;
    height: 16px;
  }
`;

const WorkspaceSelectorWrapper = styled.div`
  order: 2;
  margin-left: 5px;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 3;
    margin-left: 20px;
  }
`;

const AppsMenuWrapper = styled.div`
  margin-left: auto;
  order: 3;

  @media (max-width: ${SCREEN.TABLET}) {
    & .apps-menu__dropdown {
      min-width: 220px;
      max-width: 220px;
    }
  }

  @media (min-width: ${SCREEN.TABLET}) {
    order: 3;
  }
`;

const ConnectWrapper = styled.div`
  display: none;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
    display: block;

    & button {
      background: #0b0d17;
      border-radius: 5px;
      box-shadow: none;
      font-weight: 700;
      font-size: 16px;
      line-height: 150%;
      color: #ffffff;
      padding: 8px 24px;
      cursor: pointer;
      border: none;

      &:hover {
        box-shadow: 0px 4px 8px rgba(106, 71, 147, 0.1);
      }
    }
  }
`;

type Props = {};

const AppHeader = (props: Props) => {
  const { connect } = useGrinderyNexus();
  const { user, setAppOpened, appOpened } = useAppContext();
  const { size, width } = useWindowSize();
  let navigate = useNavigate();
  const isMatchingWorkflowNew = useMatch("/workflows/new");
  const isMatchingWorkflowEdit = useMatch("/workflows/edit/:key");
  const matchNewWorfklow = isMatchingWorkflowNew || isMatchingWorkflowEdit;

  const handleClose = () => {
    setAppOpened(!appOpened);
  };

  const handleBack = () => {
    navigate("/workflows");
  };

  return (
    <Wrapper>
      {user && matchNewWorfklow && (
        <BackWrapper>
          <IconButton icon={ICONS.BACK} onClick={handleBack} color="" />
        </BackWrapper>
      )}

      {!matchNewWorfklow ? (
        <>
          <LogoWrapper>
            <Logo variant="square" />
          </LogoWrapper>
          <CompanyNameWrapper
            onClick={() => {
              navigate("/");
            }}
          >
            Flow
          </CompanyNameWrapper>
        </>
      ) : (
        <></>
      )}

      {user && !matchNewWorfklow && (
        <WorkspaceSelectorWrapper>
          <WorkspaceSelector />
        </WorkspaceSelectorWrapper>
      )}
      {!matchNewWorfklow && (
        <AppsMenuWrapper>
          <AppsMenu apps={GRINDERY_APPS} />
        </AppsMenuWrapper>
      )}

      {!user && "ethereum" in window && (
        <ConnectWrapper>
          <button
            onClick={() => {
              connect();
            }}
          >
            Connect wallet
          </button>
        </ConnectWrapper>
      )}
      {user && (
        <UserWrapper style={{ marginLeft: matchNewWorfklow ? "auto" : 0 }}>
          <UserMenu />
        </UserWrapper>
      )}

      {user &&
        (!matchNewWorfklow || size === "phone") &&
        ((width >= parseInt(SCREEN.TABLET.replace("px", "")) &&
          width < parseInt(SCREEN.TABLET_XL.replace("px", ""))) ||
          width >= parseInt(SCREEN.DESKTOP.replace("px", ""))) && (
          <CloseButtonWrapper style={{ marginLeft: !user ? "auto" : "0px" }}>
            {size === "desktop" && !appOpened ? (
              <IconButton icon={ICONS.MENU} onClick={handleClose} color="" />
            ) : size === "desktop" ? (
              <IconButton
                icon={ICONS.COLLAPSE}
                onClick={handleClose}
                color=""
              />
            ) : (
              <IconButton icon={ICONS.CLOSE} onClick={handleClose} color="" />
            )}
          </CloseButtonWrapper>
        )}
    </Wrapper>
  );
};

export default AppHeader;
