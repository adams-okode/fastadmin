import {
  LinkOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Input,
  Layout,
  Menu,
  Row,
  Skeleton,
  Space,
  Typography,
  theme,
} from "antd";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { postFetcher } from "@/fetchers/fetchers";
import { getTitleFromModel } from "@/helpers/title";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { IModel } from "@/interfaces/configuration";
import { ConfigurationContext } from "@/providers/ConfigurationProvider";
import { SignInUserContext } from "@/providers/SignInUserProvider";
import { Content } from "antd/es/layout/layout";

const { Header, Sider } = Layout;
const { Title } = Typography;

interface ICrudContainer {
  title: string;
  breadcrumbs?: React.ReactNode;
  viewOnSite?: string;
  headerActions?: React.ReactNode;
  bottomActions?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const CrudContainer: React.FC<ICrudContainer> = ({
  title,
  breadcrumbs,
  viewOnSite,
  headerActions,
  bottomActions,
  isLoading,
  children,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState<string | undefined>();
  const [collapsed, setCollapsed] = useState(false);
  const { model } = useParams();
  const { configuration } = useContext(ConfigurationContext);
  const { signedInUser, signedInUserRefetch, signedIn } =
    useContext(SignInUserContext);
  const { t: _t } = useTranslation("CrudContainer");

  const {
    token: { colorBgContainer, colorPrimary, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (!signedIn) {
      navigate("/sign-in");
    }
  }, [navigate, signedIn]);

  const { mutate: mutateSignOut } = useMutation({
    mutationFn: () => postFetcher("/sign-out", {}),
    onSuccess: () => {
      signedInUserRefetch();
    },
  });

  const onClickSideBarMenuItem = (item: any) => {
    switch (item.key) {
      case "dashboard":
        navigate("/");
        break;
      default:
        navigate(`/list/${item.key}`);
        break;
    }
  };

  const onClickRightMenuItem = (item: any) => {
    switch (item.key) {
      case "sign-out":
        mutateSignOut();
        break;
      default:
        break;
    }
  };

  const uniqueCategories = [
    ...new Set(
      configuration.models
        .map((item) => item.category)
        .filter((category): category is string => category !== undefined),
    ),
  ];

  function toTitleCase(str: string) {
    return str.replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
  }

  const generateCategoriesItems = (category?: string) => {
    const children = configuration.models
      .filter((m: IModel) => {
        const isCategoryMatch = category === m.category?.toLowerCase();
        const isSearchMatch =
          !search || m.name.toLowerCase().includes(search.toLowerCase());
        return isCategoryMatch && isSearchMatch;
      })
      .map((m: IModel) => ({
        key: m.name,
        label: getTitleFromModel(m),
      }));

    if (!category) {
      return children;
    }

    return [
      {
        key: category.toLocaleLowerCase(),
        label: _t(toTitleCase(category)),
        children,
      },
      {
        key: `${category}-divider`,
        type: "divider",
        label: "",
      },
    ];
  };

  const items = [
    {
      key: "dashboard",
      label: _t("Dashboard"),
    },
    {
      key: "divider",
      type: "divider",
    },
    ...uniqueCategories.flatMap((category) =>
      generateCategoriesItems(category.toLocaleLowerCase()),
    ),
  ];

  const onSearch = (e: any) => setSearch(e.target.value);

  return (
    <>
      <Helmet defaultTitle={title}>
        <meta name="description" content={title} />
      </Helmet>
      <Layout style={{ maxHeight: "100vh" }}>
        <Sider
          width={200}
          trigger={null}
          theme="dark"
          collapsible
          collapsed={collapsed}
          style={{ borderRadius: 0, minHeight: "100vh" }}
        >
          <div style={{ padding: 10 }}>
            <Input
              value={search}
              onChange={onSearch}
              placeholder={_t("Search By Menu") as string}
              prefix={<SearchOutlined />}
            />
          </div>

          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[model || "dashboard"]}
            style={{
              borderRight: 0,
              //   overflowY: "scroll",
            }}
            items={items as any}
            onClick={onClickSideBarMenuItem}
          />
        </Sider>

        <Layout>
          <Header
            style={{
              background: "#FFFFFF",
              paddingInline: 20,
              boxShadow:
                "box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);",
              borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
            }}
          >
            <Row justify="space-between">
              <Col>
                <Space>
                  <Row>
                    <Col>
                      <Button
                        type="text"
                        icon={
                          collapsed ? (
                            <MenuUnfoldOutlined />
                          ) : (
                            <MenuFoldOutlined />
                          )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                          fontSize: "20px",
                          width: 64,
                          height: 64,
                        }}
                      />
                    </Col>
                    <Col>
                      <Link to="/">
                        <span
                          style={{
                            color: colorBgContainer,
                            fontSize: 18,
                            marginLeft: 10,
                          }}
                        >
                          {configuration.site_name}
                        </span>
                      </Link>
                    </Col>
                  </Row>
                </Space>
              </Col>
              <Col>
                <Space>
                  {!isMobile && (
                    <span style={{ color: "#010101", marginRight: 5 }}>
                      {
                        (signedInUser || ({} as any))[
                          configuration.username_field
                        ]
                      }
                    </span>
                  )}

                  <Menu
                    style={{ background: colorPrimary }}
                    theme="light"
                    mode="horizontal"
                    items={[
                      {
                        key: signedInUser?.id || "key",
                        icon: (
                          <UserOutlined style={{ color: colorBgContainer }} />
                        ),
                        children: [
                          {
                            key: "sign-out",
                            label: _t("Sign Out"),
                          },
                        ],
                      },
                    ]}
                    onClick={onClickRightMenuItem}
                  />
                </Space>
              </Col>
            </Row>
          </Header>

          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div
              style={{
                border: "solid 1px rgb(201, 201, 201)",
                borderRadius: 5,
                padding: 10,
              }}
            >
              {breadcrumbs}
              {viewOnSite && (
                <Col>
                  <a href={viewOnSite} target="_blank" rel="noreferrer">
                    <LinkOutlined /> {_t("View on site")}
                  </a>
                </Col>
              )}
            </div>
            <Card
              title={
                <Row justify="space-between">
                  <Col>
                    <Title style={{ margin: 0, marginTop: 15 }} level={5}>
                      {title}
                    </Title>
                  </Col>
                  {headerActions ? <Col>{headerActions}</Col> : null}
                </Row>
              }
              style={{ marginTop: 16 }}
            >
              <Skeleton loading={isLoading} active={true}>
                {children}
                {bottomActions ? (
                  <Row>
                    <Col>{bottomActions}</Col>
                  </Row>
                ) : null}
              </Skeleton>
            </Card>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};
