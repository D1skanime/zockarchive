# ZockArchive release procedure

This procedure describes a future, human-controlled beta publication. It does not create a tag, publish a release, push an image, log in to a registry, or claim that an image is already available.

## Intended beta image contract

The first intended prerelease is `v0.1.0-beta.1`. A published GitHub release triggers the workflow, which accepts the optional leading `v` and publishes linux/amd64 and linux/arm64 images to the authoritative retained package path:

```text
ghcr.io/d1skanime/zockarchive:0.1.0-beta.1
ghcr.io/d1skanime/zockarchive:beta
```

The workflow never publishes `latest`, major, or minor aliases. Operators should communicate and deploy an exact reviewed image tag. The `beta` alias is only for the approved beta series.

Docker Hub is optional. The workflow logs in to and pushes its configured Docker Hub destination only when both Docker Hub repository secrets are present. Missing one or both credentials must not block the required GHCR publication.

## Future human release sequence

1. Complete the isolated installation and Portainer UAT evidence for the reviewed candidate.
2. Obtain explicit human approval to release.
3. Merge through the normal reviewed pull-request path.
4. Create and publish the `v0.1.0-beta.1` GitHub prerelease.
5. Observe the GitHub Actions workflow and confirm its GHCR output for the exact tag.
6. If both Docker Hub credentials are configured, optionally observe its output too. Otherwise record that GHCR remained the only publication route.
7. Communicate the exact GHCR image tag and the image-only Portainer installation guide to operators.

Approval is required before the tag, GitHub release, image publication, or any push that performs those actions. A successful build is not substitute approval.

## Known limitation

The workflow receives ScreenScraper developer build arguments from GitHub Secrets. Those arguments remain embedded in the published image and can be inspected by someone who can inspect that image. Treat this as a known image limitation. Do not place additional secret values in release notes, examples, or operator support material.
