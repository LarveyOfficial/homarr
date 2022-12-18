import { IconClock } from '@tabler/icons';
import { HomarrCardWrapper } from '../../components/Dashboard/Tiles/HomarrCardWrapper';
import { BaseTileProps } from '../../components/Dashboard/Tiles/type';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'torrents-status',
  icon: IconClock,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 2,
    maxHeight: 2,
  },
  component: BitTorrentTile,
});

export type IBitTorrent = IWidget<typeof definition['id'], typeof definition>;

interface BitTorrentTileProps extends BaseTileProps {
  module: IBitTorrent; // TODO: change to new type defined through widgetDefinition
}

function BitTorrentTile({ className, module }: BitTorrentTileProps) {
  return <HomarrCardWrapper>Bit Torrent</HomarrCardWrapper>;
}

export default definition;
