import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';

import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export type WidgetsRemoveModalInnerProps = {
  widgetId: string;
};

export const WidgetsRemoveModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<WidgetsRemoveModalInnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.widgetId}`, 'common']);
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);
  if (!configName) return null;
  const handleDeletion = () => {
    updateConfig(
      configName,
      (prev) => ({
        ...prev,
        widgets: prev.widgets.filter((w) => w.id !== innerProps.widgetId),
      }),
      true
    );
    context.closeModal(id);
  };

  return (
    <Stack>
      <Trans
        i18nKey="common:removeConfirm"
        components={[<Text key={0} weight={500} />]}
        values={{ item: innerProps.widgetId }}
      />
      <Group position="right">
        <Button onClick={() => context.closeModal(id)} variant="light">
          {t('common:cancel')}
        </Button>
        <Button onClick={() => handleDeletion()}>{t('common:ok')}</Button>
      </Group>
    </Stack>
  );
};
