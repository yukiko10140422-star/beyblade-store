import type {Route} from './+types/api.newsletter';
import {data} from 'react-router';

export async function action({request, context}: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();

  if (!email || !email.includes('@')) {
    return data({error: 'Please enter a valid email address'}, {status: 400});
  }

  try {
    const {storefront} = context;

    // Storefront customerCreate requires a password. We generate a random one
    // the subscriber will never use — they're opted in for marketing only.
    // If they later want account access they can use "Forgot password".
    const randomPassword =
      crypto.randomUUID().replace(/-/g, '') +
      Math.random().toString(36).slice(2);

    const result = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {
          email,
          password: randomPassword,
          acceptsMarketing: true,
        },
      },
    });

    const errors = result?.customerCreate?.customerUserErrors;

    if (errors?.length) {
      const alreadyExists = errors.some((e: unknown) => {
        if (typeof e !== 'object' || e === null) return false;
        const err = e as {code?: string; message?: string};
        return err.code === 'TAKEN' || err.message?.includes('taken');
      });
      if (alreadyExists) {
        return data({success: true, message: "You're already subscribed!"});
      }
      return data({error: errors[0].message}, {status: 400});
    }

    return data({success: true, message: 'Welcome to the Vault!'});
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return data(
      {error: 'Something went wrong. Please try again.'},
      {status: 500},
    );
  }
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
