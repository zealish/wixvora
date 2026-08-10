'use client';

import { Block } from '../lib/block-types';
import { NavbarBlock } from './navbar-block';
import { HeroBlock } from './hero-block';
import { ContainerBlock } from './container-block';
import { GridCustomBlock } from './grid-custom-block';
import { HeadingBlock } from './heading-block';
import { ParagraphBlock } from './paragraph-block';
import { ImageBlock } from './image-block';
import { PricingBlock } from './pricing-block';
import { FormContactBlock } from './form-contact-block';
import { FooterBlock } from './footer-block';
import { ButtonBlock } from './button-block';
import { BadgeBlock } from './badge-block';
import { CardBlock } from './card-block';

interface BlockRendererProps {
  block: Block;
  updateProps: (blockId: string, newProps: Record<string, any>) => void;
  isPreviewMode: boolean;
  setIsEditingInline: (editing: boolean) => void;
}

export function BlockRenderer({
  block,
  updateProps,
  isPreviewMode,
  setIsEditingInline,
}: BlockRendererProps) {
  const handleUpdateProps = (newProps: Record<string, any>) => {
    updateProps(block.id, newProps);
  };

  switch (block.type) {
    case 'navbar':
      return (
        <NavbarBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'hero':
      return (
        <HeroBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'container':
      return (
        <ContainerBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'grid_custom':
      return (
        <GridCustomBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'heading':
      return (
        <HeadingBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'paragraph':
      return (
        <ParagraphBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'image':
      return (
        <ImageBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'pricing':
      return (
        <PricingBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'form_contact':
      return (
        <FormContactBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'footer':
      return (
        <FooterBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'button':
      return (
        <ButtonBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'badge':
      return (
        <BadgeBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    case 'card':
      return (
        <CardBlock
          block={block}
          updateProps={handleUpdateProps}
          isPreviewMode={isPreviewMode}
          setIsEditingInline={setIsEditingInline}
        />
      );
    default:
      return (
        <div className="flex items-center justify-center p-8 text-gray-400">
          Blok {(block as any).type || 'Unknown'}
        </div>
      );
  }
}
