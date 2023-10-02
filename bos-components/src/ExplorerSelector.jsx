State.init({
  selected: "nearblocks",
});

const config = {
  nearblocks:
    props?.network === "testnet"
      ? "https://testnet.nearblocks.io"
      : "https://nearblocks.io",
  nearexplorer:
    props?.network === "testnet"
      ? "https://explorer.testnet.near.org"
      : "https://explorer.near.org",
};

function getFirstPathSegment(url) {
  const match = url.match(/\/([^/]+)/);

  if (match && match[1]) {
    return match[1];
  } else {
    return "";
  }
}

function selectUrlAfterSecondSlash(url) {
  const segments = url.split("/");

  if (segments.length >= 3) {
    const selectedUrl = segments.slice(2).join("/");
    return selectedUrl;
  } else {
    return "";
  }
}

function getHref(link) {
  if (link)
    switch (getFirstPathSegment(link)) {
      case "accounts":
        return (
          config.nearblocks + "/address/" + selectUrlAfterSecondSlash(link)
        );
      case "transactions":
        return config.nearblocks + "/txns/" + selectUrlAfterSecondSlash(link);
      case "stats":
        return config.nearblocks + "/charts";

      default:
        return config.nearblocks + link;
    }
  else {
    return config.nearblocks;
  }
}

function linkNearblocks(link) {
  if (link)
    switch (getFirstPathSegment(link)) {
      case "":
        return true;
      case "accounts":
        return true;
      case "transactions":
        return true;
      case "blocks":
        return true;
      case "stats":
        return true;
      default:
        return false;
    }
}

function linkNearExplorer(link) {
  if (link)
    switch (getFirstPathSegment(link)) {
      case "":
        return true;
      case "accounts":
        return true;
      case "transactions":
        return true;
      case "blocks":
        return true;
      case "stats":
        return true;
      case "nodes":
        return true;
      default:
        return false;
    }
}

const path = props?.path || "";
const href = getHref(path);
const hasLinkNearblocks = props?.path
  ? !linkNearblocks(path)
  : false;
const hasLinkNearExplorer = props?.path
  ? !linkNearExplorer(path)
  : false;

function onSelect(data) {
  State.update(data);
}

const Main = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 80vh;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const H3 = styled.h3`
  text-align: center;
  font-size: 32px;
  margin-bottom: 20px;
`;

const H6 = styled.h6`
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const NearBlocksButton = styled.a`
  height: 191px;
  width: 264px;
  border: ${props.selected === "nearblocks" ? "3px solid #338E7B" : ""};
  position: relative;
  border-radius: 10px;
  cursor: ${hasLinkNearblocks ? "not-allowed" : "pointer"};
  box-shadow: ${props.selected === "nearblocks" ? "" : " 0 0 3px  #999"};
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  opacity: ${hasLinkNearblocks ? "0.7" : "1"};
`;

const ImageTab = styled.img`
  height: 40px;
  width: 174px;
`;

const Tag = styled.span`
  font-size: 10px;
  text-align: center;
  position: absolute;
  border-radius: 0px 5px 0px 5px;
  top: 0px;
  right: 0px;
  background-color: #338e7b;
  color: white;
  padding: 3px;
`;

const NearExplorerButton = styled.a`
  height: 191px;
  width: 264px;
  border: ${props.selected === "nearexplorer" ? "3px solid #338E7B" : ""};
  position: relative;
  border-radius: 10px;
  cursor: ${hasLinkNearExplorer ? "not-allowed" : "pointer"};
  box-shadow: ${props.selected === "nearexplorer" ? "" : " 0 0 3px  #999"};
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  opacity: ${hasLinkNearExplorer ? "0.7" : "1"};
`;

const TagWarning = styled.span`
  font-size: 10px;
  text-align: center;
  border-radius: 4px;
  background-color: #ebc7c7;
  color: #bf4f4f;
  padding: 3px;
  position: absolute;
  bottom: 10px;
`;

return (
  <Main>
    <H3>Near Explorer Selector</H3>
    <H6>Choose from the available Near Explorers below</H6>
    <Container>
      <NearBlocksButton
        href={!hasLinkNearblocks ? href || config.nearblocks + path : "#"}
        onClick={() => {
          onSelect({ selected: "nearblocks" });
        }}
      >
        <Tag>Recommended</Tag>
        <ImageTab
          src={"https://nearblocks.io/images/nearblocksblack.svg"}
          alt="Nearblocks"
        ></ImageTab>
      </NearBlocksButton>
      <NearExplorerButton
        href={!hasLinkNearExplorer ? config.nearexplorer + path : "#"}
        onClick={() => {
          onSelect({ selected: "nearexplorer" });
        }}
      >
        <ImageTab
          src="data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2221%22%20height%3D%2220%22%20viewBox%3D%220%200%2021%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M16.5528%201.01528L12.3722%207.22222C12.3127%207.31161%2012.2875%207.41954%2012.3014%207.52604C12.3153%207.63254%2012.3673%207.73042%2012.4477%207.80156C12.5282%207.87271%2012.6317%207.91231%2012.7391%207.91305C12.8465%207.91378%2012.9505%207.87559%2013.0319%207.80556L17.1472%204.23611C17.1713%204.21453%2017.2012%204.20045%2017.2332%204.19557C17.2652%204.19068%2017.2979%204.19522%2017.3274%204.20862C17.3568%204.22203%2017.3817%204.24371%2017.3991%204.27104C17.4164%204.29836%2017.4254%204.33014%2017.425%204.3625V15.5375C17.425%2015.5717%2017.4144%2015.6051%2017.3948%2015.6331C17.3752%2015.6611%2017.3474%2015.6824%2017.3152%2015.6941C17.2831%2015.7058%2017.2481%2015.7073%2017.2151%2015.6984C17.182%2015.6895%2017.1525%2015.6707%2017.1306%2015.6444L4.69167%200.754167C4.49159%200.51791%204.24246%200.328063%203.9616%200.197824C3.68073%200.067585%203.37487%207.92977e-05%203.06528%207.36094e-08H2.63056C2.0655%207.36094e-08%201.52358%200.224469%201.12403%200.624025C0.724468%201.02358%200.5%201.5655%200.5%202.13056V17.8694C0.5%2018.4345%200.724468%2018.9764%201.12403%2019.376C1.52358%2019.7755%202.0655%2020%202.63056%2020C2.99488%2020.0001%203.35316%2019.9068%203.67119%2019.7291C3.98922%2019.5513%204.2564%2019.2951%204.44722%2018.9847L8.62778%2012.7778C8.68732%2012.6884%208.71248%2012.5805%208.6986%2012.474C8.68472%2012.3675%208.63274%2012.2696%208.55228%2012.1984C8.47182%2012.1273%208.36832%2012.0877%208.26092%2012.087C8.15352%2012.0862%208.04948%2012.1244%207.96806%2012.1944L3.85278%2015.7639C3.82866%2015.7855%203.79878%2015.7996%203.76679%2015.8044C3.7348%2015.8093%203.70208%2015.8048%203.67263%2015.7914C3.64317%2015.778%203.61826%2015.7563%203.60092%2015.729C3.58358%2015.7016%203.57458%2015.6699%203.575%2015.6375V4.45972C3.57501%204.42551%203.58555%204.39213%203.60519%204.36412C3.62483%204.3361%203.65261%204.31481%203.68477%204.30313C3.71693%204.29145%203.7519%204.28995%203.78494%204.29883C3.81797%204.30772%203.84748%204.32655%203.86944%204.35278L16.3069%2019.2458C16.507%2019.4821%2016.7562%2019.6719%2017.037%2019.8022C17.3179%2019.9324%2017.6237%2019.9999%2017.9333%2020H18.3681C18.648%2020.0002%2018.9252%2019.9452%2019.1838%2019.8382C19.4425%2019.7312%2019.6775%2019.5743%2019.8755%2019.3765C20.0735%2019.1786%2020.2305%2018.9437%2020.3377%2018.6851C20.4448%2018.4265%2020.5%2018.1494%2020.5%2017.8694V2.13056C20.5%201.5655%2020.2755%201.02358%2019.876%200.624025C19.4764%200.224469%2018.9345%207.36094e-08%2018.3694%207.36094e-08C18.0051%20-9.56524e-05%2017.6468%200.093176%2017.3288%200.270914C17.0108%200.448651%2016.7436%200.704924%2016.5528%201.01528Z%22%20fill%3D%22%2311181C%22%2F%3E%3C%2Fsvg%3E"
          alt="Near Explorer"
        />
        {/*<TagWarning>explorer.near.org will soon sunset.</TagWarning>*/}
      </NearExplorerButton>
    </Container>
  </Main>
);
