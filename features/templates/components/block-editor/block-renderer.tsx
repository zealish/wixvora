"use client";

import type { BlockConfig } from "../../lib/block-types";
import { NavbarBlock } from "./blocks/navbar-block";
import { HeroBlock } from "./blocks/hero-block";
import { ContainerBlock } from "./blocks/container-block";
import { GridCustomBlock } from "./blocks/grid-custom-block";
import { HeadingBlock } from "./blocks/heading-block";
import { ParagraphBlock } from "./blocks/paragraph-block";
import { ImageBlock } from "./blocks/image-block";
import { PricingBlock } from "./blocks/pricing-block";
import { FormContactBlock } from "./blocks/form-contact-block";
import { FooterBlock } from "./blocks/footer-block";

export function BlockRenderer({ block }: { block: BlockConfig }) {
  switch (block.type) {
    case "navbar":
      return <NavbarBlock props={block.props} />;
    case "hero":
      return <HeroBlock props={block.props} />;
    case "container":
      return <ContainerBlock props={block.props} />;
    case "grid_custom":
      return <GridCustomBlock props={block.props} />;
    case "heading":
      return <HeadingBlock props={block.props} />;
    case "paragraph":
      return <ParagraphBlock props={block.props} />;
    case "image":
      return <ImageBlock props={block.props} />;
    case "pricing":
      return <PricingBlock props={block.props} />;
    case "form_contact":
      return <FormContactBlock props={block.props} />;
    case "footer":
      return <FooterBlock props={block.props} />;
  }
}
