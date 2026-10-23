import { Flashlight } from "@/components/effects/Flashlight";
import { Layout } from "@/components/layout/Layout";
import AdminPage from "@/pages/AdminPage";
import DictionaryPage from "@/pages/DictionaryPage";
import HomePage from "@/pages/HomePage";
import LinksPage from "@/pages/LinksPage";
import ListeningPage from "@/pages/ListeningPage";
import MockTestsPage from "@/pages/MockTestsPage";
import ReadingPage from "@/pages/ReadingPage";
import SpeakingPage from "@/pages/SpeakingPage";
import WritingPage from "@/pages/WritingPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Flashlight />
      <Layout>
        <Outlet />
      </Layout>
    </>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const mockTestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mock-tests",
  component: MockTestsPage,
});

const readingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reading",
  component: ReadingPage,
});

const listeningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listening",
  component: ListeningPage,
});

const speakingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/speaking",
  component: SpeakingPage,
});

const writingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/writing",
  component: WritingPage,
});

const dictionaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dictionary",
  component: DictionaryPage,
});

const linksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/links",
  component: LinksPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  mockTestsRoute,
  readingRoute,
  listeningRoute,
  speakingRoute,
  writingRoute,
  dictionaryRoute,
  linksRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
