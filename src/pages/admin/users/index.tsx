import { Badge, Button, Container, Grid, Group, Stack, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconMail } from '@tabler/icons';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import NextLink from 'next/link';
import { useState } from 'react';
import { openInviteCreateModal } from '../../../components/Admin/Invite/InviteCreateModal';
import { UserList } from '../../../components/Admin/User/UserList';
import { GenericSearch } from '../../../components/Admin/User/UserSearch';
import { MainLayout } from '../../../components/layout/admin/main-layout';
import { useScreenLargerThan } from '../../../hooks/useScreenLargerThan';
import { createSSGHelper } from '../../../server/api/ssg-helper';
import { getServerAuthSession } from '../../../server/auth';
import { prisma } from '../../../server/db';
import { getServerSideTranslations } from '../../../tools/server/getServerSideTranslations';
import { RouterOutputs, api } from '../../../utils/api';

type UserFilter = RouterOutputs['user']['filters'][number];

const Users: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
  const { t } = useTranslation();
  const { data: userFilters } = api.user.filters.useQuery();
  const [filter, setFilter] = useState<UserFilter>('all');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebouncedValue(search, 200);
  const largerThanSm = useScreenLargerThan('sm');

  return (
    <MainLayout>
      <Head>
        <title>Users - Homarr</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Stack>
          <div>
            <Title>{t(`users:filters/${filter}/title`)}</Title>
            <Title order={4} weight={400}>
              Manage the users that can access your dashboards.
            </Title>
          </div>

          {largerThanSm ? (
            <Group position="apart" noWrap>
              <GenericSearch
                search={search}
                setSearch={setSearch}
                filters={userFilters}
                applyFilter={(v) => setFilter(v)}
                labelTranslationPath={(v) => `users:filters/${v}/label`}
                searchPlaceholder="users:search/placeholder"
              />
              <Group noWrap>
                <InvitesButton />
                <Button onClick={openInviteCreateModal}>Invite user</Button>
              </Group>
            </Group>
          ) : (
            <Grid>
              <Grid.Col span={12}>
                <Group noWrap position="apart" grow>
                  <InvitesButton />
                  <Button onClick={openInviteCreateModal}>Invite user</Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={12}>
                <GenericSearch
                  search={search}
                  setSearch={setSearch}
                  filters={userFilters}
                  applyFilter={(v) => setFilter(v)}
                  labelTranslationPath={(v) => `users:filters/${v}/label`}
                  searchPlaceholder="users:search/placeholder"
                />
              </Grid.Col>
            </Grid>
          )}
          <UserList search={debouncedSearch} filter={filter} />
        </Stack>
      </Container>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  const currentUser = await prisma?.user.findFirst({
    where: {
      id: session?.user?.id,
    },
  });

  if (!currentUser?.isAdmin) {
    return {
      notFound: true,
    };
  }

  const ssg = await createSSGHelper(context);

  await ssg.user.filters.prefetch();
  await ssg.user.list.prefetch({ filter: 'all', search: '' });
  await ssg.invite.count.prefetch();

  const translations = await getServerSideTranslations(
    ['common', 'form'],
    context.locale,
    context.req,
    context.res
  );

  return { props: { ...translations, trpcState: ssg.dehydrate() } };
};

export default Users;

const InvitesButton = () => {
  const { data: count } = api.invite.count.useQuery();

  return (
    <Button
      component={NextLink}
      href="/admin/users/invites"
      variant="default"
      leftIcon={<IconMail size={16} />}
      rightIcon={count === 0 || count === undefined ? null : <Badge>{count}</Badge>}
    >
      Invites
    </Button>
  );
};
